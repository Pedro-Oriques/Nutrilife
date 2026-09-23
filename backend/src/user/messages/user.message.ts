export const USER_MESSAGES = {
  USER_ALREADY_REGISTERED: 'Usuário já existe.',
  REGISTRATION_SUCCESS: 'Cadastro realizado com sucesso.',
  EMAIL_ALREADY_REGISTERED: 'Este e-mail já foi cadastrado.',
  EMAIL_INVALID_FORMAT: 'O e-mail inserido é inválido.',
  PASSWORD_RULES:
    'Senha precisa conter: uma letra maiúscula, minúscula, número, e um caractere especial(@#$%).',
  CONFIRM_PASSWORD_MUST_MATCH: 'A confirmação de senha deve ser igual à senha.',
  LOGIN_SUCCESS: 'Login realizado com sucesso.',

  FIELD_REQUIRED: (field: string) => `O campo ${field} é obrigatório.`,
  FIELD_ACCEPTS_ONLY: (field: string, what: string) =>
    `O campo ${field} aceita apenas ${what}.`,
  FIELD_IS_STRING: (field: string) => `O campo ${field} deve ser uma string.`,
  FIELD_LENGTH_BETWEEN: (field: string, min: number, max: number) =>
    `O campo ${field} deve ter entre ${min} e ${max} caracteres.`,
  FIELD_INITIAL_CAPITAL: (field: string) =>
    `O campo ${field} deve iniciar com letra maiúscula.`,
  FIELD_ONLY_LETTERS_SPACES: (field: string) =>
    `O campo ${field} deve conter apenas letras e espaços.`,
  PIN_CODE_RULES: 'O PIN deve conter exatamente 4 dígitos.',
};
