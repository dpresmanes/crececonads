# MCP de Google (GA4, Search Console y Tag Manager)

Servidor MCP remoto para usar Google Analytics 4, Search Console y Tag Manager desde Claude.
Corre en Railway (proyecto `mcp-google`, carpeta `mcp-google/` de este repo, rama web-v2).

## Variables en Railway (se cargan en la web de Railway, nunca en un chat ni en el repo)
- `GOOGLE_SA_JSON`: el JSON completo de la cuenta de servicio de Google Cloud.
- `MCP_TOKEN`: cadena al azar de 24+ caracteres. La URL del conector es `https://<dominio>/<MCP_TOKEN>/mcp`.
- Opcionales: `GA4_PROPIEDAD`, `GSC_SITIO`, `GTM_CUENTA`, `GTM_CONTENEDOR` (valores por defecto).

## Cuenta de servicio
1. Google Cloud → proyecto → habilitar: Google Analytics Data API, Google Analytics Admin API, Google Search Console API, Tag Manager API.
2. IAM → Cuentas de servicio → crear → Claves → JSON.
3. Agregar el mail de la cuenta de servicio como usuario en: GA4 (Administrar acceso, Editor), Search Console
   (Configuración → Usuarios y permisos, Propietario o Completo) y Tag Manager (Administrar usuarios, Publicar).

## Herramientas
GA4: `ga4_propiedades`, `ga4_reporte`, `ga4_tiempo_real`, `ga4_eventos_clave`, `ga4_marcar_evento_clave`.
Search Console: `gsc_sitios`, `gsc_rendimiento`, `gsc_inspeccionar_url`, `gsc_sitemaps`, `gsc_enviar_sitemap`.
Tag Manager: `gtm_contenedores`, `gtm_listar`, `gtm_crear_variable_capa_datos`, `gtm_crear_activador_evento`,
`gtm_crear_etiqueta_evento_ga4`, `gtm_cambios_pendientes`, `gtm_publicar` (solo con `confirmar=True` y el OK de Damián).
`estado_conexion` comprueba todo junto.
