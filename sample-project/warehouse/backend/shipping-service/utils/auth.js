export const getUserIdFromContext = (context) => {
  const userId = context?.user?.id;
  console.log("userid : ", userId);
  if (!userId) {
    throw new Error('UNAUTHENTICATED: User ID not found in context.');
  }
  return userId;
};