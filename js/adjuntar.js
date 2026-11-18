
document.addEventListener("DOMContentLoaded", function () {

    const archivoInput = document.getElementById("archivo-adjunto");
    const archivoSeleccionado = document.getElementById("archivo-seleccionado");
    const archivoNombre = document.getElementById("archivo-nombre");
    const archivoError = document.getElementById("archivo-error");
    const quitarArchivo = document.getElementById("quitar-archivo");

    const MAX_MB = 10;
    const MAX_BYTES = MAX_MB * 1024 * 1024;

    const extensionesPermitidas = [
        "pdf", "doc", "docx", "xls", "xlsx", "txt"
    ];

    archivoInput.addEventListener("change", function () {

        archivoError.hidden = true;
        archivoSeleccionado.hidden = true;

        const archivo = archivoInput.files[0];

        if (!archivo) return;

        const extension = archivo.name.split(".").pop().toLowerCase();

        if (!extensionesPermitidas.includes(extension)) {
            mostrarError("Formato no permitido. Adjuntá PDF, Word, Excel o TXT.");
            return;
        }

        if (archivo.size > MAX_BYTES) {
            mostrarError(
                "El archivo supera el tamaño máximo de " + MAX_MB + " MB."
            );
            return;
        }

        const tamano = (archivo.size / 1024 / 1024).toFixed(2);

        archivoNombre.textContent =
            archivo.name + " (" + tamano + " MB)";

        archivoSeleccionado.hidden = false;
    });

    quitarArchivo.addEventListener("click", function () {
        archivoInput.value = "";
        archivoSeleccionado.hidden = true;
        archivoError.hidden = true;
    });

    function mostrarError(mensaje) {
        archivoInput.value = "";
        archivoError.textContent = mensaje;
        archivoError.hidden = false;
    }
});
