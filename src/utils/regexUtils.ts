export const isEmail = (email: string): boolean => {
    const emailFormat = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;
    return email.trim() !== '' && emailFormat.test(email);
};