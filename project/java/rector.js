const ESTRUCTURA_PARALELO = {
    // Básico: SOLO 8,9,10 A/B
    basico: {
        "8-A": [], "8-B": [],
        "9-A": [], "9-B": [],
        "10-A": [], "10-B": []
    },
    // Bachillerato: 1B,2B,3B por carrera A/B
    bachillerato: {
        computacion: { "1B-A": [], "1B-B": [], "2B-A": [], "2B-B": [], "3B-A": [], "3B-B": [] },
        contabilidad: { "1B-A": [], "1B-B": [], "2B-A": [], "2B-B": [], "3B-A": [], "3B-B": [] },
        ciencias: { "1B-A": [], "1B-B": [], "2B-A": [], "2B-B": [], "3B-A": [], "3B-B": [] }
    }
};

async function inicializarSistema() {
    alumnosBase = JSON.parse(JSON.stringify(ESTRUCTURA_PARALELO));

    console.log("✅ Sistema inicializado correctamente");
}
async function cargarNuevosRegistrados() {

    const contenedor = document.getElementById("nuevosUsuarios");

    if (!contenedor) return;

    contenedor.innerHTML = "";

    try {

        const res = await fetch("/perfiles");
        const alumnos = await res.json();

        const pendientes = alumnos.filter(
            a => a.estado_asignacion !== "asignado"
        );

        if (pendientes.length === 0) {

            contenedor.innerHTML = `
                <div style="
                    background:white;
                    padding:20px;
                    border-radius:12px;
                    text-align:center;
                    color:#666;
                ">
                    ✅ No hay alumnos pendientes
                </div>
            `;

            return;
        }

        pendientes.forEach(alumno => {

            const card = document.createElement("div");

            card.className = "cardAlumno";

            card.style.cssText = `
                background:white;
                border-radius:15px;
                padding:18px;
                margin-bottom:15px;
                box-shadow:0 4px 10px rgba(0,0,0,.08);
            `;

            card.innerHTML = `

                <h3>👨‍🎓 ${alumno.nombre}</h3>

                <p><b>Curso:</b> ${alumno.curso}</p>

                ${
                    alumno.curso.includes("BGU")
                    ? `<p><b>Especialidad:</b> ${alumno.especialidad}</p>`
                    : ""
                }

                <label>Paralelo</label><br>

                <select id="paralelo_${alumno.usuario_id}">
                    <option value="">Seleccione</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                </select>

                <br><br>

                <button class="btn-editar">
                    ✅ Asignar
                </button>

            `;

            card.querySelector("button").onclick = () => {

                const paralelo =
                    document.getElementById(
                        `paralelo_${alumno.usuario_id}`
                    ).value;

                if (!paralelo) {

                    alert("Seleccione un paralelo");

                    return;

                }

                asignarAlumno(
                    alumno.usuario_id,
                    alumno.curso,
                    paralelo,
                    alumno.especialidad
                );

            };

            contenedor.appendChild(card);

        });

    } catch (error) {

        console.error(error);

    }

}
function cargarPanelRector() {
    cargarNuevosRegistrados();  // ✅ Pendientes del registro
    cargarCarpetasParalelos();  // ✅ Paralelos organizados
}

async function asignarUsuario(nombreCompleto, paraleloClave) {

    try {

        // 🔹 1. obtener usuario desde backend
        const res = await fetch("/usuarios");
        const usuarios = await res.json();

        let usuario = usuarios.find(u => u.nombre === nombreCompleto);

        if (!usuario) {
            return mostrarMensaje("❌ Usuario no encontrado", "error");
        }

        // 🔹 2. actualizar en MySQL
        const updateRes = await fetch("/asignar-usuario", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: usuario.id,
                paralelo: paraleloClave
            })
        });

        const data = await updateRes.json();
        console.log(data);

        // 🔹 3. actualizar memoria local
        if (!alumnosBase.basico[paraleloClave]) {
            alumnosBase.basico[paraleloClave] = [];
        }

        // evitar duplicados
        let existe = alumnosBase.basico[paraleloClave]
            .find(a => a.nombreCompleto === nombreCompleto);

        if (!existe) {

            alumnosBase.basico[paraleloClave].push({
                nombreCompleto,
                paralelo: paraleloClave
            });
        }

        mostrarMensaje(
            `✅ ${nombreCompleto} asignado a ${paraleloClave}`,
            "success"
        );

        cargarPanelRector();

    } catch (error) {
        console.error(error);
        mostrarMensaje("❌ Error al asignar usuario", "error");
    }
}

async function cargarCarpetasParalelos() {

    try {

        // Obtener los alumnos reales
        const res = await fetch("/perfiles");
        const alumnos = await res.json();

        const container = document.getElementById("carpetasParalelos");

        if (!container) return;

        container.innerHTML = "";

        let estructuraAcademica = [

            { curso: "8", paralelos: ["A","B"] },
            { curso: "9", paralelos: ["A","B"] },
            { curso: "10", paralelos: ["A","B"] },

            { curso: "1BGU", especialidad: "Ciencias", paralelos: ["A","B"] },
            { curso: "1BGU", especialidad: "Contabilidad", paralelos: ["A","B"] },
            { curso: "1BGU", especialidad: "Computacion", paralelos: ["A","B"] },

            { curso: "2BGU", especialidad: "Ciencias", paralelos: ["A","B"] },
            { curso: "2BGU", especialidad: "Contabilidad", paralelos: ["A","B"] },
            { curso: "2BGU", especialidad: "Computacion", paralelos: ["A","B"] },

            { curso: "3BGU", especialidad: "Ciencias", paralelos: ["A","B"] },
            { curso: "3BGU", especialidad: "Contabilidad", paralelos: ["A","B"] },
            { curso: "3BGU", especialidad: "Computacion", paralelos: ["A","B"] }

        ];

        const carpetas = {};

        estructuraAcademica.forEach(item=>{

            item.paralelos.forEach(paralelo=>{

                const nombre =
                    item.especialidad
                    ? `${item.curso} ${item.especialidad}-${paralelo}`
                    : `${item.curso}-${paralelo}`;

                carpetas[nombre]=[];

            });

        });

        alumnos.forEach(alumno=>{

            if(alumno.estado_asignacion!=="asignado") return;

            let curso=(alumno.curso||"").trim();
            let paralelo=(alumno.paralelo||"").trim();
            let especialidad=(alumno.especialidad||"").trim();

            especialidad=especialidad
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g,"");

            const clave=
                especialidad!==""
                ? `${curso} ${especialidad}-${paralelo}`
                : `${curso}-${paralelo}`;

            if(carpetas[clave]){

                carpetas[clave].push(alumno);

            }

        });

        Object.keys(carpetas).forEach(clave=>{

            crearCarpetaParalelo(

                container,
                clave,
                clave,
                carpetas[clave]

            );

        });

    } catch(err){

        console.error(err);

    }

}

function crearCarpetaParalelo(container, nombre, clave, alumnos) {

    let div = document.createElement("div");

    div.className = "carpeta-paralelo";

    div.style.cssText = `
        background: linear-gradient(135deg,#6c5ce7,#a29bfe);
        color:white;
        border-radius:16px;
        padding:15px;
        width:170px;
        min-height:140px;
        display:flex;
        flex-direction:column;
        justify-content:center;
        align-items:center;
        cursor:pointer;
        margin:6px;
    `;

    div.onclick = () => verAlumnosParalelo(clave);

    div.innerHTML = `
        <div style="font-size:36px;">📁</div>

        <div style="font-weight:bold;margin-top:8px;text-align:center;">
            ${nombre}
        </div>

        <div style="
            margin-top:10px;
            background:rgba(255,255,255,.25);
            border-radius:10px;
            padding:4px 8px;
        ">
            ${alumnos.length}/15 alumnos
        </div>
    `;

    container.appendChild(div);

}

async function restablecerFechaInicio(autorizacionId) {

    let confirmar = confirm(
        "⚠️ ¿Seguro que deseas restablecer la fecha de inicio?\n\nTodos los docentes deberán configurar una nueva fecha."
    );

    if (!confirmar) return;

    try {

        const respuesta = await fetch(
            "/restablecer-fecha",
            {
                method: "POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body: JSON.stringify({
                    autorizacionId
                })
            }
        );

        const datos = await respuesta.json();

        if(datos.ok){

            alert("✅ Fecha de inicio restablecida correctamente");
            verificarAutorizacionRestablecimiento();
        }else{

            alert("❌ No se pudo restablecer");
        }

    } catch (error) {

        console.error(error);

        alert("❌ Error restableciendo fecha");
    }
}

async function verAlumnosParalelo(clave) {

    try {

        const res = await fetch("/perfiles");
        const perfiles = await res.json();

        console.log("Clave:", clave);
        console.log(perfiles);

        const alumnos = perfiles.filter(a => {

            let nombreCurso = a.curso;

            if (a.especialidad && a.especialidad.trim() !== "") {
                nombreCurso += " " + a.especialidad;
            }

            const claveAlumno =
                `${nombreCurso}-${a.paralelo}`.toUpperCase();

            return claveAlumno === clave.toUpperCase();

        });

        document.getElementById("modalTitulo").innerHTML =
            `📂 ${clave} (${alumnos.length})`;

        let filas = "";

        if (alumnos.length === 0) {

            filas = `
                <tr>
                    <td colspan="3">
                        No hay alumnos
                    </td>
                </tr>
            `;

        } else {

            alumnos.forEach((a, i) => {

                filas += `
                    <tr>
                        <td>${i + 1}</td>
                        <td>${escaparHTML(a.nombre)}</td>
                        <td>
                            <button onclick="eliminarAlumno(${a.usuario_id}, '${clave}')">
                                ❌
                            </button>
                        </td>
                    </tr>
                `;

            });

        }

        document.getElementById("listaAlumnosModal").innerHTML = `
            <table style="width:100%">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Nombre</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
                    ${filas}
                </tbody>
            </table>
        `;

        document.getElementById("modalAlumnos").style.display = "flex";

    } catch (e) {

        console.error(e);

    }

}

function formatearParalelo(paralelo) {
    if (!paralelo) return "";

    let partes = paralelo.split("-");

    // Bachillerato
    if (paralelo.includes("B")) {

        let grado = partes[0];

        if (grado === "1B") grado = "1ro Bachillerato";
        else if (grado === "2B") grado = "2do Bachillerato";
        else if (grado === "3B") grado = "3ro Bachillerato";

        return grado + " " + partes[1];
    }

    // Básico
        if (partes[0] === "8") return "8vo " + partes[1];
        if (partes[0] === "9") return "9no " + partes[1];
        if (partes[0] === "10") return "10mo " + partes[1];
        return paralelo;
}

async function moverAlumno(nombreCompleto, claveOrigen, carreraOrigen) {

    let nuevoParalelo = prompt("Nuevo paralelo (ej: 8-B, 9-A, 1B-A):");

    if (!nuevoParalelo) return;
    nuevoParalelo = nuevoParalelo.toUpperCase();
    let alumnoMovido = null;
    let carreraNueva = null;

    // 🔹 Buscar y remover
    if (carreraOrigen) {

        let lista = alumnosBase.bachillerato[carreraOrigen][claveOrigen];

        alumnoMovido = lista.find(a => a.nombreCompleto === nombreCompleto);

        alumnosBase.bachillerato[carreraOrigen][claveOrigen] =
            lista.filter(a => a.nombreCompleto !== nombreCompleto);

    } else {

        let lista = alumnosBase.basico[claveOrigen];

        alumnoMovido = lista.find(a => a.nombreCompleto === nombreCompleto);

        alumnosBase.basico[claveOrigen] =
            lista.filter(a => a.nombreCompleto !== nombreCompleto);
    }

    if (!alumnoMovido) {
        mostrarMensaje("❌ Alumno no encontrado", "error");
        return;
    }

    alumnoMovido.paralelo = nuevoParalelo;

    // 🔹 Agregar al nuevo paralelo
    if (nuevoParalelo.startsWith("8") ||
        nuevoParalelo.startsWith("9") ||
        nuevoParalelo.startsWith("10")) {

if (!alumnosBase.basico[nuevoParalelo]) {
    alumnosBase.basico[nuevoParalelo] = [];
}

if (alumnosBase.basico[nuevoParalelo].length >= 15) {

    mostrarMensaje("❌ El paralelo ya está lleno", "error");

    if (carreraOrigen) {
        alumnosBase.bachillerato[carreraOrigen][claveOrigen].push(alumnoMovido);
    } else {
        alumnosBase.basico[claveOrigen].push(alumnoMovido);
    }
    return;
}

alumnosBase.basico[nuevoParalelo].push(alumnoMovido);

    } else {

    carreraNueva = prompt("Carrera: computacion / contabilidad / ciencias");

    if (
        !alumnosBase.bachillerato[carreraNueva] ||
        !alumnosBase.bachillerato[carreraNueva][nuevoParalelo]
    ) {
        mostrarMensaje("❌ Carrera o paralelo inválido", "error");
        if (carreraOrigen) {
        alumnosBase.bachillerato[carreraOrigen][claveOrigen].push(alumnoMovido);
    } else {
        alumnosBase.basico[claveOrigen].push(alumnoMovido);
    }
        return;
    }
if (
    alumnosBase.bachillerato[carreraNueva][nuevoParalelo].length >= 15
) {

    mostrarMensaje("❌ El paralelo ya está lleno", "error");

    // devolver al paralelo original
    if (carreraOrigen) {

        alumnosBase.bachillerato[carreraOrigen][claveOrigen]
            .push(alumnoMovido);

    } else {

        alumnosBase.basico[claveOrigen]
            .push(alumnoMovido);
    }

    return;
}

alumnoMovido.carrera = carreraNueva;

alumnosBase.bachillerato[carreraNueva][nuevoParalelo]
    .push(alumnoMovido);
}

   try {

    await fetch(
        "/mover-usuario",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
            nombre: nombreCompleto,
            paralelo: nuevoParalelo,
            carrera: carreraNueva || alumnoMovido.carrera
            })
        }
    );

} catch (error) {

    console.error(error);
}

    mostrarMensaje("✅ Alumno movido correctamente", "success");

    cargarPanelRector();
}

async function eliminarAlumno(id, paralelo) {

    try {

        const confirmar = confirm("⚠️ ¿Seguro que deseas eliminar este alumno?");
        if (!confirmar) return;

        // 🔹 eliminar en backend MySQL
        const res = await fetch("/eliminar-usuario", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id })
        });

        const data = await res.json();
        console.log(data);

        mostrarMensaje("✅ Alumno eliminado", "success");
        document.getElementById("modalAlumnos").style.display = "none";

        cargarPanelRector();

    } catch (error) {
        console.error(error);
        mostrarMensaje("❌ Error al eliminar alumno", "error");
    }
}

async function asignarAlumno(
    usuario_id,
    curso,
    paralelo,
    especialidad
) {

    try {

        const res = await fetch(
            "/asignar-alumno",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    usuario_id,
                    curso,
                    paralelo,
                    especialidad
                })
            }
        );

        const data = await res.json();

        if (!data.success) {

            mostrarMensaje(
                data.mensaje || "❌ Error al asignar alumno",
                "error"
            );

            return;

        }

        mostrarMensaje(
            "✅ Alumno asignado correctamente",
            "success"
        );

        cargarPanelRector();

    } catch (error) {

        console.error(error);

        mostrarMensaje(
            "❌ Error al asignar alumno",
            "error"
        );

    }

}

document.addEventListener("DOMContentLoaded", () => {
    inicializarSistema();
});

function mostrarDocentesAsignadosRector() {

    // 🔥 OCULTAR TODAS LAS SECCIONES DEL RECTOR (Corregida la clase a .seccionRector)
    document.querySelectorAll(".seccionRector").forEach(sec => {
        sec.style.display = "none";
    });

    // 🔥 MOSTRAR SECCIÓN DE ASIGNADOS
    const seccion = document.getElementById("seccionDocentesAsignados");
    if (seccion) {
        seccion.style.display = "block";
    }

    // 🔥 CARGAR LOS DATOS DESDE EL BACKEND
    cargarDocentesAsignados();
}
//Cambio actualizado 
function mostrarRector(id) {

    document.querySelectorAll(".seccionRector").forEach(seccion => {
        seccion.style.display = "none";
    });

    document.getElementById(id).style.display = "block";

    if (id === "gestDocentes") {
        cargarSolicitudesMaterias();
    }

    if (id === "seccionDocentesAsignados") {
        cargarDocentesAsignados();
    }

    if (id === "gestHorarios") {
        cargarParalelosParaHorario();
    }

}

async function cargarSolicitudesMaterias() {

    const contenedor = document.getElementById("listaSolicitudesMaterias");
    if (!contenedor) return;

    contenedor.innerHTML = "";

    try {

        const [resSolicitudes, resAsignados] = await Promise.all([
            fetch("/solicitudes-docentes"),
            fetch("/docentes-asignados")
        ]);

        const docentesSolicitudes = await resSolicitudes.json();
        const docentesAsignados = await resAsignados.json();

        // IDs de docentes que ya tienen materia asignada
        const idsAsignados = docentesAsignados.map(d => String(d.docente_id));

        // Solo mostrar los que aún no tienen materia
        const pendientes = docentesSolicitudes.filter(docente =>
            !idsAsignados.includes(String(docente.id))
        );

        if (pendientes.length === 0) {

            contenedor.innerHTML = `
                <div style="background:white;padding:25px;border-radius:15px;text-align:center;">
                    ✅ No hay solicitudes de materias pendientes.
                </div>
            `;

            return;
        }

        // Materias disponibles
        const materias = [
            {id:1,nombre:"Matemática"},
            {id:2,nombre:"Inglés"},
            {id:3,nombre:"Ciudadanía"},
            {id:4,nombre:"Química"},
            {id:5,nombre:"Emprendimiento"},
            {id:6,nombre:"Lengua y Literatura"},
            {id:7,nombre:"Biología"},
            {id:8,nombre:"Historia"},
            {id:9,nombre:"Educación Física"},
            {id:10,nombre:"Tutoría"},
            {id:11,nombre:"Proyecto"},
            {id:12,nombre:"Computación"}
        ];

        pendientes.forEach(docente => {

            const opciones = materias.map(m =>
                `<option value="${m.id}">${m.nombre}</option>`
            ).join("");

            contenedor.innerHTML += `

                <div class="card p-3 mb-3 shadow-sm"
                    style="background:#fff;border-radius:15px;border-left:6px solid #3498db;">

                    <h4>👨‍🏫 ${docente.nombre}</h4>

                    <p style="
                        margin:10px 0;
                        color:#555;
                        font-size:15px;
                    ">
                        📚 <strong>Puede impartir:</strong>
                        ${docente.materia || "No especificó materias"}
                    </p>

                    <select id="materia_${docente.id}"
                        style="width:100%;padding:10px;margin:15px 0;border-radius:8px;">

                        <option value="">Seleccione una materia</option>
                        ${opciones}

                    </select>

                    <button
                        onclick="asignarMateriaDocente(${docente.id})"
                        style="background:#27ae60;color:white;border:none;padding:10px 18px;border-radius:8px;cursor:pointer;">

                        📚 Asignar materia

                    </button>

                </div>

                `;   
        });

    } catch (error) {

        console.error("Error:", error);

        contenedor.innerHTML = `
            <div style="color:red;text-align:center;">
                Error al cargar los docentes.
            </div>
        `;
    }

}

async function asignarMateriaDocente(docenteId) {
    const select = document.getElementById(`materia_${docenteId}`);
    if (!select || !select.value) {
        alert("⚠️ Por favor selecciona una materia primero.");
        return;
    }

    const materiaId = select.value;
    const materiaNombre = select.options[select.selectedIndex].text;

    console.log("📌 Asignando materia:", { uid: docenteId, materiaId, materiaNombre });

    try {
        const respuesta = await fetch("/asignar-materia", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                docenteId: docenteId,
                materiaId: materiaId,
                materiaNombre: materiaNombre
            })
        });

        const data = await respuesta.json();

        if (respuesta.ok) {
            alert("✅ Materia asignada con éxito");

            // A) Forzar a que la tarjeta de la interfaz DESAPAREZCA de inmediato
            const tarjeta = select.closest('.card') || select.closest('.docente-card') || select.closest('div[id^="docente_"]') || select.parentElement.parentElement;
            if (tarjeta) {
                tarjeta.remove();
            }

            // B) Volver a pedir la lista de docentes asignados
            if (typeof cargarDocentesAsignados === "function") {
                cargarDocentesAsignados();
            }
        } else {
            alert(`❌ Error: ${data.mensaje || 'No se pudo asignar'}`);
        }
    } catch (error) {
        console.error("❌ Error al asignar materia:", error);
        alert("❌ Ocurrió un error al conectar con el servidor.");
    }
}
async function cargarDocentesAsignados() {
    try {
        const res = await fetch("/docentes-asignados");
        if (!res.ok) return;
        
        const data = await res.json();
        console.log("📌 Docentes asignados recibidos:", data);
        
        const contenedor = document.getElementById("listaDocentesAsignados");
        if (!contenedor) return;

        contenedor.innerHTML = "";

        if (data.length === 0) {
            contenedor.innerHTML = "<p style='text-align:center; color:#666;'>No hay docentes asignados actualmente.</p>";
            return;
        }

        // Mapa con las 12 materias reales
        const mapaMaterias = {
            "1":"Matemática",
            "2":"Inglés",
            "3":"Ciudadanía",
            "4":"Química",
            "5":"Emprendimiento",
            "6":"Lengua y Literatura",
            "7":"Biología",
            "8":"Historia",
            "9":"Educación Física",
            "10":"Tutoría",
            "11":"Proyecto",
            "12":"Computación"
        };

        data.forEach(docente => {
            const idAsignacion = docente.id;
            const idDocente = docente.docente_id || docente.uid;
            
            const nombreDocente = docente.nombre 
                ? `${docente.nombre} ${docente.apellido || ''}` 
                : docente.docente_nombre || `Lic. Axel Castillo`;

            // Buscamos el nombre de la materia por su ID o por su propiedad nombre
            const matId = String(docente.materia_id || docente.materiaId || "");
            const materia = docente.materia_nombre || docente.materiaNombre || mapaMaterias[matId] || "Materia no asignada";

            contenedor.innerHTML += `
                <div class="card p-3 mb-3 shadow-sm" style="background: #ffffff; border-radius: 15px; border-left: 6px solid #27ae60; padding: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; margin-top: 15px;">
                    <div>
                        <h4 style="margin: 0 0 8px 0; color: #2c3e50;">👤 ${nombreDocente}</h4>
                        <p style="margin: 0; font-size: 16px; color: #555;">📚 Materia asignada: <strong style="color: #27ae60;">${materia}</strong></p>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button onclick="editarMateria('${idAsignacion}')" style="background: #f39c12; color: white; border: none; padding: 8px 15px; border-radius: 8px; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 5px;">
                            ✏️ Modificar
                        </button>
                        <button onclick="eliminarDocente('${idDocente}')" style="background: #e74c3c; color: white; border: none; padding: 8px 15px; border-radius: 8px; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 5px;">
                            🗑️ Eliminar
                        </button>
                    </div>
                </div>
            `;
        });

    } catch (err) {
        console.error("❌ Error al cargar docentes asignados:", err);
    }
}

function modificarAsignacion(id) {
    alert(`Modificar asignación ID: ${id}. Aquí puedes abrir un selector o modal para cambiar de materia.`);
}

async function editarMateria(idAsignacion) {
    // Lista exacta de las 12 materias de tu portal
    const materiasPortal = [
        { id: "1", nombre: "Matemáticas" },
        { id: "2", nombre: "Inglés" },
        { id: "3", nombre: "Ciudadanía" },
        { id: "4", nombre: "Química" },
        { id: "5", nombre: "Emprendimiento" },
        { id: "6", nombre: "Lengua y Literatura" },
        { id: "7", nombre: "Historia" },
        { id: "8", nombre: "Biología" },
        { id: "9", nombre: "Educación Física" },
        { id: "10", nombre: "Computación" },
        { id: "11", nombre: "Tutoría" },
        { id: "12", nombre: "Proyecto" }
    ];

    // Limpiamos modal previo si existe
    const modalPrevio = document.getElementById("modalEditarMateria");
    if (modalPrevio) modalPrevio.remove();

    // Generamos las opciones del <select>
    const opcionesHTML = materiasPortal
        .map(m => `<option value="${m.id}">${m.nombre}</option>`)
        .join("");

    // Generamos la ventana modal
    const modalHTML = `
        <div id="modalEditarMateria" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999;">
            <div style="background: #ffffff; padding: 25px; border-radius: 15px; width: 360px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.2); font-family: sans-serif;">
                <h3 style="margin-top: 0; color: #2c3e50;">✏️ Cambiar Materia</h3>
                <p style="color: #666; font-size: 14px; margin-bottom: 15px;">Seleccione la nueva materia para la asignación:</p>
                
                <select id="selectNuevaMateria" style="width: 100%; padding: 12px; border-radius: 8px; border: 2px solid #3498db; font-size: 15px; margin-bottom: 20px; outline: none; background: #f8f9fa;">
                    ${opcionesHTML}
                </select>

                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button onclick="guardarCambioMateria('${idAsignacion}')" style="background: #27ae60; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold;">
                        💾 Guardar
                    </button>
                    <button onclick="document.getElementById('modalEditarMateria').remove()" style="background: #e74c3c; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold;">
                        ❌ Cancelar
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);
}

async function guardarCambioMateria(idAsignacion) {
    const select = document.getElementById("selectNuevaMateria");
    const nuevaMateriaId = select.value;
    const nuevaMateriaNombre = select.options[select.selectedIndex].text;

    try {
        const response = await fetch("/editar-materia", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: idAsignacion,
                materia_id: nuevaMateriaId,
                materia_nombre: nuevaMateriaNombre
            })
        });

        const data = await response.json();

        // Cerramos la ventana flotante
        const modal = document.getElementById("modalEditarMateria");
        if (modal) modal.remove();

        if (response.ok && (data.success || response.status === 200)) {
            alert(`✅ Materia actualizada a "${nuevaMateriaNombre}" con éxito`);
            cargarDocentesAsignados();
        } else {
            alert("❌ No se pudo actualizar: " + (data.error || data.message || "Error en el servidor"));
        }
    } catch (error) {
        console.error("❌ Error al guardar cambio de materia:", error);
        alert("❌ Error de comunicación con el servidor.");
    }
}
async function eliminarDocente(id) {

    console.log("🗑️ Eliminando docente ID:", id);

    const confirmar = confirm(
        "⚠️ ¿Seguro que deseas eliminar este docente definitivamente?\n\n" +
        "Esta acción:\n" +
        "• Eliminará todas sus asignaciones de materias\n" +
        "• Eliminará su perfil docente\n" +
        "• Eliminará su cuenta de usuario\n" +
        "• Esta acción NO se puede deshacer"
    );

    if (!confirmar) return;

    // Segunda confirmación para mayor seguridad
    const confirmar2 = confirm(
        "⚠️ ÚLTIMA ADVERTENCIA: ¿Estás completamente seguro?\n" +
        "Se eliminarán TODOS los datos del docente."
    );

    if (!confirmar2) return;

    try {
        const res = await fetch("/eliminar-docente", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id: id })
        });

        const data = await res.json();

        if (data.success) {
            alert("✅ Docente eliminado correctamente");
            await cargarDocentesAsignados();
            await cargarSolicitudesMaterias();
        } else {
            alert("❌ No se pudo eliminar el docente: " + (data.error || "Error desconocido"));
        }

    } catch (error) {
        console.error("❌ Error eliminando docente:", error);
        alert("❌ Error al eliminar el docente: " + error.message);
    }

}

function mostrarDocentesAsignados() {

    document.getElementById(
        "docentesAsignados"
    ).style.display = "block";

    cargarDocentesAsignados();
}

async function cargarParalelosParaHorario() {
    try {
        const res = await fetch("/paralelos");
        const cursos = await res.json();

        console.log("📚 Cursos recibidos:", cursos);

        const select = document.getElementById("selectorParalelo");
        select.innerHTML = "";

        if (cursos.length === 0) {
            select.innerHTML = `<option value="">⚠️ No hay cursos disponibles</option>`;
            return;
        }

        cursos.forEach(curso => {
            let texto = `${curso.nivel} - ${curso.paralelo}`;
            
            // Si tiene especialización (bachillerato)
            if (curso.especializacion && curso.especializacion !== "NULL") {
                texto += ` - ${curso.especializacion}`;
            }

            const option = document.createElement("option");
            option.value = curso.id_curso; // ✅ El id_curso es el valor
            option.textContent = texto;
            
            console.log(`📌 Opción: ${texto} (ID: ${curso.id_curso})`);
            select.appendChild(option);
        });

        // Cargar el horario del primer curso seleccionado
        if (select.options.length > 0) {
            await cargarHorario();
        }

    } catch (error) {
        console.error("❌ Error cargando paralelos:", error);
        alert("Error cargando los paralelos");
    }
}

async function cargarHorario() {

    const idCurso = document.getElementById("selectorParalelo").value;

    if (!idCurso) return;

    const resHorario =
        await fetch(`/horario/${idCurso}`);

    const horario =
        await resHorario.json();

    const resDocentes =
        await fetch("/docentes-asignados");

    const docentes =
        await resDocentes.json();

    console.log("Horario:", horario);
    console.log("Docentes:", docentes);

    const dias = [
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves",
        "Viernes"
    ];

    const horas = [

        {
            inicio:"07:00:00",
            fin:"07:40:00",
            texto:"07:00 - 07:40"
        },

        {
            inicio:"07:40:00",
            fin:"08:20:00",
            texto:"07:40 - 08:20"
        },

        {
            inicio:"08:20:00",
            fin:"09:00:00",
            texto:"08:20 - 09:00"
        },

        {
            inicio:"09:20:00",
            fin:"10:00:00",
            texto:"09:20 - 10:00"
        },

        {
            inicio:"10:00:00",
            fin:"10:40:00",
            texto:"10:00 - 10:40"
        },

        {
            inicio:"10:40:00",
            fin:"11:20:00",
            texto:"10:40 - 11:20"
        },

        {
            inicio:"11:20:00",
            fin:"12:00:00",
            texto:"11:20 - 12:00"
        }

    ];

    let html = `
        <table id="tablaHorario" class="tabla-horario">

            <thead>

                <tr>

                    <th>Hora</th>

                    ${dias.map(d => `<th>${d}</th>`).join("")}

                </tr>

            </thead>

            <tbody>
    `;

    horas.forEach(hora => {

        html += "<tr>";

        html += `<td><strong>${hora.texto}</strong></td>`;

        dias.forEach(dia => {

            const actual = horario.find(h =>

                h.dia === dia &&
                h.hora_inicio === hora.inicio &&
                h.hora_fin === hora.fin

            );

            let opciones = `
                <option value="">
                    -- Libre --
                </option>
            `;

            docentes.forEach(d => {

                const valor = `${d.materia_id}|${d.docente_id}`;

                const seleccionado =
                    actual &&
                    actual.materia_id == d.materia_id &&
                    actual.docente_id == d.docente_id
                        ? "selected"
                        : "";

                // ===== CORREGIDO =====

                const nombreMateria =
                    d.materia_nombre ||
                    d.materia ||
                    "Sin materia";

                const nombreDocente =
                    d.nombre ||
                    d.docente_nombre ||
                    "Sin docente";

                opciones += `
                    <option
                        value="${valor}"
                        ${seleccionado}
                    >
                        ${nombreMateria} (${nombreDocente})
                    </option>
                `;

            });

            html += `
                <td>

                    <select

                        class="celdaHorario"

                        data-dia="${dia}"

                        data-inicio="${hora.inicio}"

                        data-fin="${hora.fin}"

                    >

                        ${opciones}

                    </select>

                </td>
            `;

        });

        html += "</tr>";

    });

    html += `
            </tbody>
        </table>
    `;

    document.getElementById("horarioForm").innerHTML = html;

}

async function guardarHorario() {
    const select = document.getElementById("selectorParalelo");
    const idCurso = Number(select.value);

    console.log("🆔 ID Curso seleccionado:", idCurso);

    if (!idCurso || isNaN(idCurso)) {
        alert("⚠️ Seleccione un paralelo válido");
        return;
    }

    const celdas = document.querySelectorAll(".celdaHorario");
    const datos = [];

    celdas.forEach(celda => {
        if (celda.value && celda.value !== "") {
            const partes = celda.value.split("|");
            datos.push({
                id_curso: idCurso,
                id_materia: Number(partes[0]),
                id_docente: Number(partes[1]),
                dia: celda.dataset.dia,
                hora_inicio: celda.dataset.inicio,
                hora_fin: celda.dataset.fin
            });
        }
    });

    console.log("📤 Datos a guardar:", datos);

    if (datos.length === 0) {
        // Si no hay datos, preguntar si desea eliminar el horario
        if (!confirm("⚠️ No hay datos en el horario. ¿Desea eliminar el horario existente?")) {
            return;
        }
    }

    try {
        const res = await fetch(
            `/horario/guardar?idCurso=${idCurso}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(datos)
            }
        );

        const respuesta = await res.json();

        if (respuesta.ok) {
            alert(`✅ Horario guardado correctamente (${respuesta.registros || datos.length} registros)`);
            // Recargar el horario para ver los cambios
            await cargarHorario();
        } else {
            alert("❌ No se pudo guardar: " + (respuesta.mensaje || "Error desconocido"));
        }

    } catch (error) {
        console.error("❌ Error de conexión:", error);
        alert("❌ Error de conexión con el servidor");
    }
}

function mostrarHorarioRector() {
    document.querySelectorAll(".seccionRector").forEach(sec => sec.style.display = "none");

    document.getElementById("gestHorarios").style.display = "block";

    if (document.getElementById("selectorParalelo").options.length === 0) {
        cargarParalelosParaHorario();
    } else {
        cargarHorario();
    }
}

async function guardarControlAcademico(){

    const fechaNotas =
        document.getElementById("fechaNotas").value;

    const fechaConducta =
        document.getElementById("fechaConducta").value;

    const notasBloqueadas =
        document.getElementById("btnBloquearNotas").dataset.estado;

    const conductaBloqueada =
        document.getElementById("btnBloquearConducta").dataset.estado;

    console.log({
    notas_bloqueadas: notasBloqueadas,
    conducta_bloqueada: conductaBloqueada,
    fecha_cierre_notas: fechaNotas,
    fecha_cierre_conducta: fechaConducta
});

    const respuesta = await fetch(

        "/guardar-control-academico",

        {

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body: JSON.stringify({

                notas_bloqueadas: 0,

                conducta_bloqueada: 0,

                fecha_cierre_notas: fechaNotas,

                fecha_cierre_conducta: fechaConducta

            })

        }

    );

    const datos = await respuesta.json();

    if(datos.ok){
        document.getElementById("btnBloquearNotas").dataset.estado = "0";
        document.getElementById("btnBloquearNotas").innerHTML = "🔓 Notas Desbloqueadas";

        document.getElementById("btnBloquearConducta").dataset.estado = "0";
        document.getElementById("btnBloquearConducta").innerHTML = "🔓 Conducta Desbloqueada";

        alert("✅ Configuración guardada.");

    }else{

        alert("❌ Error al guardar.");

    }

}

async function cargarControlAcademico(){

    const respuesta = await fetch(
        "/control-academico"
    );

    const datos = await respuesta.json();

    if(!datos.ok) return;

    const control = datos.control;

    const btnNotas =
        document.getElementById("btnBloquearNotas");

    const btnConducta =
        document.getElementById("btnBloquearConducta");

    // Estado de los botones
    btnNotas.dataset.estado =
        Number(control.notas_bloqueadas);

    btnConducta.dataset.estado =
        Number(control.conducta_bloqueada);

    // Texto del botón Notas
    if(Number(control.notas_bloqueadas) === 1){

        btnNotas.innerHTML =
            "🔒 Notas Bloqueadas";

    }else{

        btnNotas.innerHTML =
            "🔓 Notas Desbloqueadas";

    }

    // Texto del botón Conducta
    if(Number(control.conducta_bloqueada) === 1){

        btnConducta.innerHTML =
            "🔒 Conducta Bloqueada";

    }else{

        btnConducta.innerHTML =
            "🔓 Conducta Desbloqueada";

    }

    // Fechas
    if(control.fecha_cierre_notas){

        document.getElementById("fechaNotas").value =
            control.fecha_cierre_notas
                .replace(" ","T")
                .substring(0,16);

    }

    if(control.fecha_cierre_conducta){

        document.getElementById("fechaConducta").value =
            control.fecha_cierre_conducta
                .replace(" ","T")
                .substring(0,16);

    }

}

function cerrarNotasAutomaticamente(){

    conexion.query(

        `
        UPDATE control_academico

        SET

            notas_bloqueadas = 1,
            cierre_notas_ejecutado = 1

        WHERE

            fecha_cierre_notas <= NOW()

            AND cierre_notas_ejecutado = 0
        `,

        (err, resultado)=>{

            if(err){

                console.error("Error cerrando notas:", err);

                return;

            }

            if(resultado.affectedRows > 0){

                console.log("🔒 Las notas fueron bloqueadas automáticamente.");

            }

        }

    );

}

function alternarBloqueoNotas(){

    const boton =
        document.getElementById("btnBloquearNotas");

    if(boton.dataset.estado == "1"){

        boton.dataset.estado = "0";
        boton.innerHTML = "🔓 Notas Desbloqueadas";

    }else{

        boton.dataset.estado = "1";
        boton.innerHTML = "🔒 Notas Bloqueadas";

    }

}

function alternarBloqueoConducta(){

    const boton =
        document.getElementById("btnBloquearConducta");

    if(boton.dataset.estado == "1"){

        boton.dataset.estado = "0";

        boton.innerHTML =
            "🔓 Conducta Desbloqueada";

    }else{

        boton.dataset.estado = "1";

        boton.innerHTML =
            "🔒 Conducta Bloqueada";

    }

}

async function confirmarEditarMateria(idAsignacion) {
    const select = document.getElementById("nuevaMateriaSelect");
    const nuevaMateriaId = select.value;
    const nuevaMateriaNombre = select.options[select.selectedIndex].text;

    if (!nuevaMateriaId) {
        alert("⚠️ Seleccione una materia");
        return;
    }

    try {
        const response = await fetch("/editar-materia", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: idAsignacion,
                materia_id: nuevaMateriaId
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Error al modificar");
        }

        alert(`✅ Materia cambiada a "${nuevaMateriaNombre}" correctamente`);
        
        // Cerrar el modal
        cerrarModalEditarMateria();

        // Recargar las listas
        await cargarDocentesAsignados();
        await cargarSolicitudesMaterias();

    } catch (error) {
        console.error("❌ Error modificando materia:", error);
        alert("❌ " + (error.message || "Error al modificar la materia"));
    }
}