export const getUserIdFromContext = (context) => {
  const userId = context?.user?.id;
  if (!userId) {
    throw new Error('UNAUTHENTICATED: User ID not found in context.');
  }
  return userId;
};