/**
 * Devuelve la URL base del frontend según el ambiente (NODE_ENV).
 * Usa las variables de entorno FRONTEND_URL_PROD (producción) o
 * FRONTEND_URL_DEV (cualquier otro entorno).
 *
 * Se exporta como función utilitaria para ser reutilizada en
 * cualquier servicio sin necesidad de inyectar ConfigService.
 *
 * @example
 * const url = `${getFrontendUrl()}/admin/vacations/${id}`;
 */
export function getFrontendUrl(): string {
  const nodeEnv = process.env.NODE_ENV ?? 'development';
  return nodeEnv === 'production'
    ? (process.env.FRONTEND_URL_PROD ?? '')
    : (process.env.FRONTEND_URL_DEV ?? '');
}
