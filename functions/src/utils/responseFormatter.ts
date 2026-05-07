export const responseFormatter = (data: any) => ({
  success: true,
  data,
});

export const errorFormatter = (message: string) => ({
  success: false,
  error: message,
});