# CRM de Leads AutomatIA — Instalación (≈5 minutos)

Resultado final:
- Carpeta **`AutomatIA_CRM`** en la raíz de tu Google Drive ("Mi unidad").
- Dentro, la planilla **`CRM_Leads_AutomatIA`** (hojas *Leads* y *Resumen*).
- Cada formulario de la web agrega una fila y envía un correo a
  **consultora.automatia@gmail.com** con asunto **`New_Leads_AutomatIA`**.

> **Recomendado:** haz todo con la cuenta **consultora.automatia@gmail.com**.
> Así la planilla queda en el Drive de la consultora y los correos salen y llegan a esa misma cuenta.

---

## Paso 1 — Crear el script
1. Entra a <https://script.google.com> → **Nuevo proyecto**.
2. Cambia el nombre (arriba a la izquierda) a `AutomatIA CRM`.
3. Borra todo el contenido de `Código.gs` y pega el contenido de **`Code.gs`** (esta carpeta).
4. Guarda (💾 o `Ctrl+S`).

## Paso 2 — Crear la carpeta y la planilla
1. En la barra superior, selecciona la función **`setup`** y pulsa **Ejecutar**.
2. Google pedirá permisos → **Revisar permisos** → elige tu cuenta →
   "Google no verificó esta app" → **Configuración avanzada** → **Ir a AutomatIA CRM** → **Permitir**.
   (Es normal: el script es tuyo.)
3. En el **Registro de ejecución** aparecerá el enlace al CRM. La carpeta `AutomatIA_CRM` ya está en tu Drive.
4. *(Opcional)* Ejecuta **`testLead`** → debe aparecer una fila de prueba y llegar el correo `New_Leads_AutomatIA`. Borra la fila después.

## Paso 3 — Publicarlo como aplicación web
1. **Implementar** → **Nueva implementación** → ⚙️ tipo **Aplicación web**.
2. Configura:
   - **Ejecutar como:** *Yo*
   - **Quién tiene acceso:** *Cualquier usuario* (necesario para que la web pueda enviar datos).
3. **Implementar** → copia la **URL de la aplicación web** (termina en `/exec`).

## Paso 4 — Conectar la web
En `automatia_V5_el_futuro_se_hace_presente.html`, busca (al final del archivo):

```js
const FORM_ENDPOINT = '';
```

y pega la URL:

```js
const FORM_ENDPOINT = 'https://script.google.com/macros/s/XXXXXXXX/exec';
```

Guarda, abre la web, envía un formulario de prueba y revisa la planilla + tu correo.

---

## Uso diario del CRM
| Columna | Uso |
|---|---|
| Fecha / Nombre / Email / Origen / Página | Se llenan solos desde la web |
| Estado | Lista: Nuevo → Contactado → Diagnóstico agendado → Propuesta enviada → Ganado / Perdido (con colores) |
| Responsable, Próxima acción, Fecha próxima acción, Notas | Para tu seguimiento comercial |

La hoja **Resumen** cuenta los leads por estado automáticamente.

## Si cambias el código más adelante
**Implementar → Gestionar implementaciones → ✏️ → Versión: Nueva versión → Implementar.**
Así la URL `/exec` no cambia y la web sigue funcionando.

## Límites
Cuenta Gmail gratuita: hasta ~100 correos de alerta por día (más que suficiente para empezar).
