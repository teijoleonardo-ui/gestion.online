export interface LoginData {
  usuario: string;
  contrasena: string;
}

export interface LoginResult {
  success: boolean;
}

export async function loginUser(_data: LoginData): Promise<LoginResult> {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ success: true }), 400);
  });
}
