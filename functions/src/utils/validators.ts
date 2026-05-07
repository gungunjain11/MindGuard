export const validateJournalInput = (text: string): boolean => {
  return Boolean(text && text.trim().length >= 10);
};

export const validateUid = (uid: string): boolean => {
  return Boolean(uid && uid.length > 0);
};