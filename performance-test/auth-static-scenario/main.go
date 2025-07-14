package main

import (
	"bytes"
	"context"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"sync"
	"syscall"
	"time"

	"github.com/golang-jwt/jwt"
	"github.com/graphql-go/graphql"
	"github.com/graphql-go/handler"
)

// --- Configuration ---
const (
	gatewayToken = "7f7756c9491e223db0fa8dc516f72584"
	serviceName  = "auth-service"
	subgraph     = "auth"
	jwtSecret    = "ThisMySecret"
	tokenTTL     = 24 * time.Hour
)

// --- Static User ---
var staticUser = &User{
	ID:    "static-user-id",
	Email: "test@example.com",
	Name:  "Test User",
	Role:  "user",
}

// --- Models ---
type User struct {
	ID    string `json:"id"`
	Email string `json:"email"`
	Name  string `json:"name"`
	Role  string `json:"role"`
}

type AuthPayload struct {
	User  *User  `json:"user"`
	Token string `json:"token"`
}

type UserDataPayload struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	User    *User  `json:"user"`
}

// --- JWT and Token Management ---
type Claims struct {
	Email string `json:"email"`
	Name  string `json:"name"`
	Role  string `json:"role"`
	jwt.StandardClaims
}

func signAuthToken() (string, error) {
	expirationTime := time.Now().Add(tokenTTL)
	claims := &Claims{
		Email: staticUser.Email,
		Name:  staticUser.Name,
		Role:  staticUser.Role,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: expirationTime.Unix(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(jwtSecret))
}

func verifyAuthToken(tokenString string) (*Claims, error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(jwtSecret), nil
	})

	if err != nil || !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}
	return claims, nil
}

// --- GraphQL Schema ---
var userType *graphql.Object
var authPayloadType *graphql.Object
var userDataPayloadType *graphql.Object
var schema graphql.Schema

func buildGraphQLSchema() {
	userType = graphql.NewObject(graphql.ObjectConfig{
		Name: "User",
		Fields: graphql.Fields{
			"id":    &graphql.Field{Type: graphql.NewNonNull(graphql.String)},
			"email": &graphql.Field{Type: graphql.NewNonNull(graphql.String)},
			"name":  &graphql.Field{Type: graphql.NewNonNull(graphql.String)},
			"role":  &graphql.Field{Type: graphql.NewNonNull(graphql.String)},
		},
	})

	authPayloadType = graphql.NewObject(graphql.ObjectConfig{
		Name: "AuthPayload",
		Fields: graphql.Fields{
			"user":  &graphql.Field{Type: graphql.NewNonNull(userType)},
			"token": &graphql.Field{Type: graphql.NewNonNull(graphql.String)},
		},
	})

	userDataPayloadType = graphql.NewObject(graphql.ObjectConfig{
		Name: "UserDataPayload",
		Fields: graphql.Fields{
			"success": &graphql.Field{Type: graphql.NewNonNull(graphql.Boolean)},
			"message": &graphql.Field{Type: graphql.NewNonNull(graphql.String)},
			"user":    &graphql.Field{Type: userType},
		},
	})

	rootQuery := graphql.NewObject(graphql.ObjectConfig{
		Name: "RootQuery",
		Fields: graphql.Fields{
			"getUserData": &graphql.Field{
				Type: graphql.NewNonNull(userDataPayloadType),
				Args: graphql.FieldConfigArgument{
					"token": &graphql.ArgumentConfig{Type: graphql.String},
				},
				Resolve: resolveGetUserData,
			},
		},
	})

	rootMutation := graphql.NewObject(graphql.ObjectConfig{
		Name: "RootMutation",
		Fields: graphql.Fields{
			"login": &graphql.Field{
				Type: graphql.NewNonNull(authPayloadType),
				Args: graphql.FieldConfigArgument{
					"email":    &graphql.ArgumentConfig{Type: graphql.NewNonNull(graphql.String)},
					"password": &graphql.ArgumentConfig{Type: graphql.NewNonNull(graphql.String)},
				},
				Resolve: resolveLogin,
			},
			"logout": &graphql.Field{
				Type: graphql.NewNonNull(graphql.String),
				Args: graphql.FieldConfigArgument{
					"token": &graphql.ArgumentConfig{Type: graphql.String},
				},
				Resolve: resolveLogout,
			},
		},
	})

	var err error
	schema, err = graphql.NewSchema(graphql.SchemaConfig{
		Query:    rootQuery,
		Mutation: rootMutation,
	})
	if err != nil {
		log.Fatalf("❌ Failed to create GraphQL schema: %v", err)
	}
}

// --- GraphQL Resolvers ---
func extractAuthToken(p graphql.ResolveParams) (string, error) {
	tokenArg, _ := p.Args["token"].(string)
	if tokenArg != "" {
		return tokenArg, nil
	}
	req, ok := p.Context.Value("request").(*http.Request)
	if !ok {
		return "", fmt.Errorf("could not get request from context")
	}
	authHeader := req.Header.Get("Authorization")
	if authHeader == "" {
		return "", fmt.Errorf("missing authentication token")
	}
	if strings.HasPrefix(authHeader, "Bearer ") {
		return strings.TrimSpace(authHeader[7:]), nil
	}
	return authHeader, nil
}

func resolveLogin(p graphql.ResolveParams) (interface{}, error) {
	email, _ := p.Args["email"].(string)
	password, _ := p.Args["password"].(string)

	// Static credentials check
	if email != "test@example.com" || password != "password" {
		return nil, fmt.Errorf("invalid credentials")
	}

	token, err := signAuthToken()
	if err != nil {
		return nil, fmt.Errorf("failed to generate token: %v", err)
	}

	return &AuthPayload{User: staticUser, Token: token}, nil
}

func resolveLogout(p graphql.ResolveParams) (interface{}, error) {
	// Token revocation not implemented for load testing
	return "Logged out successfully", nil
}

func resolveGetUserData(p graphql.ResolveParams) (interface{}, error) {
	token, err := extractAuthToken(p)
	if err != nil {
		return UserDataPayload{Success: false, Message: err.Error(), User: nil}, nil
	}

	_, err = verifyAuthToken(token)
	if err != nil {
		return UserDataPayload{Success: false, Message: "Unauthorized", User: nil}, nil
	}

	return UserDataPayload{
		Success: true,
		Message: "User data fetched",
		User:    staticUser,
	}, nil
}

// --- Health Announcer ---
func getGraphQLSchemaString() (string, error) {
	return `
		type User {
			id: ID!
			email: String!
			name: String!
			role: String!
		}
		type AuthPayload {
			user: User!
			token: String!
		}
		type UserDataPayload {
			success: Boolean!
			message: String!
			user: User
		}
		type Query {
			getUserData(token: String): UserDataPayload!
		}
		type Mutation {
			login(email: String!, password: String!): AuthPayload!
			logout(token: String): String!
		}
	`, nil
}

func announce(port int) {
	gatewayURL := os.Getenv("GATEWAY_URL")
	if gatewayURL == "" {
		gatewayURL = "http://localhost:5000"
	}
	selfURL := fmt.Sprintf("http://host.docker.internal:%d/graphql", port)
	healthURL := fmt.Sprintf("%s/admin/health?token=%s", gatewayURL, gatewayToken)

	schemaString, err := getGraphQLSchemaString()
	if err != nil {
		log.Printf("❌ [Port %d] Could not get schema string: %v", port, err)
		return
	}

	payload := map[string]interface{}{
		"service":  serviceName,
		"url":      selfURL,
		"subgraph": subgraph,
		"schema":   schemaString,
	}
	body, _ := json.Marshal(payload)

	tr := &http.Transport{
		TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
	}
	client := &http.Client{Transport: tr}
	res, err := client.Post(healthURL, "application/json", bytes.NewBuffer(body))

	if err != nil {
		log.Printf("❌ [Port %d] Error announcing health: %v", port, err)
		return
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		log.Printf("❌ [Port %d] Health announce failed: %s", port, res.Status)
	} else {
		log.Printf("✅ [Port %d] Announced health for %s", port, serviceName)
	}
}

// --- Server ---
func startServer(port int, wg *sync.WaitGroup) {
	defer wg.Done()

	go func() {
		ticker := time.NewTicker(20 * time.Second)
		defer ticker.Stop()
		announce(port)
		for range ticker.C {
			announce(port)
		}
	}()

	h := handler.New(&handler.Config{
		Schema:     &schema,
		Pretty:     true,
		GraphiQL:   true,
		Playground: true,
		RootObjectFn: func(ctx context.Context, r *http.Request) map[string]interface{} {
			return map[string]interface{}{"request": r}
		},
	})

	mux := http.NewServeMux()
	mux.Handle("/graphql", h)
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.Redirect(w, r, "/graphql", http.StatusMovedPermanently)
	})

	server := &http.Server{
		Addr:    fmt.Sprintf(":%d", port),
		Handler: mux,
	}

	log.Printf("🚀 Auth service ready at http://localhost:%d/graphql", port)
	if err := server.ListenAndServe(); err != http.ErrServerClosed {
		log.Fatalf("❌ [Port %d] Server error: %v", port, err)
	}
}

func main() {
	buildGraphQLSchema()

	startPort := 4000
	endPort := 4001
	var wg sync.WaitGroup

	for port := startPort; port <= endPort; port++ {
		wg.Add(1)
		go startServer(port, &wg)
	}

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	<-stop
	log.Println("Shutting down servers...")
	wg.Wait()
	log.Println("All servers stopped.")
}
