// Variables
const formulario = document.getElementById('agregar-gasto')
const ListaGastos = document.getElementById('gastos')
const ls = window.localStorage;
const PresupuestoOBJ = 'OBJETOPresupuesto'

// Clases
class Presupuesto{
    constructor(presupuesto){
        //Presupuesto fijo
        this.presupuesto = Number(presupuesto);
        this.restante = Number(presupuesto)
        this.gastos = [];
    }

    nuevoGasto(gasto){
        this.gastos = [...this.gastos,gasto]
        this.presupuestoRestante()
    }

    presupuestoRestante(){
        const total = this.gastos.reduce((total,gasto)=>total + gasto.cantidad,0);
        this.restante = this.presupuesto - total;
    }
    eliminarGasto(id){
        this.gastos = this.gastos.filter(gasto => gasto.id != id)
        this.presupuestoRestante();
    }
}

class UI{
    insertarPresupuesto(cantidad){
        //Extraemos los datos
        const {presupuesto,restante} = cantidad

        //Insertamos los datos
        document.getElementById('total').textContent = presupuesto;
        document.getElementById('restante').textContent = restante;
    }

    mostrarAlerta(message,type){
        const divMessage = document.createElement('DIV')
        divMessage.classList.add('text-center','alert')

        if(type === 'error'){
            divMessage.classList.add('alert-danger');
        }
        else{
            divMessage.classList.add('alert-success')
        }
        
        divMessage.textContent = message

        setTimeout(()=>{
            divMessage.remove()
        },2000)

        document.querySelector('.primario').insertBefore(divMessage,formulario)   
    }

    agregarGastoListado(gastos){
        this.LimpiarHTML()

        gastos.forEach(gasto => {
            
            const {nombre, cantidad, id} = gasto
               
            //crear li
            const nuevoGasto = document.createElement('li')
            nuevoGasto.style.marginTop = '0.5rem'
            nuevoGasto.className = 'List-group-item d-flex justify-content-between align-items-center'

            nuevoGasto.innerHTML = `${nombre} <span class="badge badge-primary badge-pill">${cantidad}</span>`

            const deleteButtton = document.createElement('button')
            deleteButtton.classList.add('btn','btn-danger','borrar-gasto')
            deleteButtton.innerHTML = `Borrar &times`
            deleteButtton.dataset.id = id
           
            deleteButtton.onclick =()=>{
                eliminarGasto(id)
               
            }
            // LimpiarHTML(ListaGastos)
            nuevoGasto.appendChild(deleteButtton)
            ListaGastos.appendChild(nuevoGasto)
 
        });
    }

    actualizarRestante(restante){
        document.getElementById('restante').textContent = restante;  
    }

    LimpiarHTML(){
        while(ListaGastos.firstChild){
            ListaGastos.removeChild(ListaGastos.firstChild)
        }
    }    

    alertarRestante(Presupuesto){
        const {presupuesto,restante} = Presupuesto
        const divRestante  = document.querySelector('.restante');

        //Presupuesto 75%
        if((presupuesto / 4) >= restante){
            divRestante.classList.remove('alert-success','alert-warning');
            divRestante.classList.add('alert-danger')
            //Presupuesto 50%
        }else if((presupuesto / 2 ) >= restante){
            divRestante.classList.remove('alert-success','alert-danger');
            divRestante.classList.add('alert-warning')
        }
        else{
            divRestante.classList.remove('alert-danger','alert-warning');
            divRestante.classList.add('alert-success')
        }

        if(restante <=0){
            this.mostrarAlerta('PRESUPUESTO AGOTADO','error')
            formulario.querySelector('button[type="submit"]').disabled = true;
        }
        else{
            formulario.querySelector('button[type="submit"]').disabled = false;
        }

    }
}

const ui =  new UI();
let presupuesto 


// Eventos
eventListener();

function eventListener(){


    if(!ls.getItem(PresupuestoOBJ) || (JSON.parse(ls.getItem(PresupuestoOBJ)).gastos.length) === 0 ){
      document.addEventListener('DOMContentLoaded',addPresupuesto) 
    }

    else{
        const dataObjet = JSON.parse(ls.getItem(PresupuestoOBJ))
       
 
        presupuesto = new Presupuesto()
        presupuesto.presupuesto =  dataObjet.presupuesto;
        presupuesto.restante    =  dataObjet.restante;
        presupuesto.gastos      =  dataObjet.gastos;

        const {gastos} = presupuesto
        ui.agregarGastoListado(gastos)
        ui.insertarPresupuesto(presupuesto)
        ui.alertarRestante(presupuesto)
    }
   
    formulario.addEventListener('submit',addGasto)
}

// Funciones

function addPresupuesto(){
    const UsuarioPresupuesto = prompt('Cuales tu presupuesto?')
  
    if(UsuarioPresupuesto === null || UsuarioPresupuesto.trim() === ''  || isNaN(UsuarioPresupuesto) || UsuarioPresupuesto <= 0){ 
        window.location.reload()
    }

    // ls.setItem(PRESUPUESTO_KEY, UsuarioPresupuesto);    
    presupuesto =  new Presupuesto(UsuarioPresupuesto)
    ui.insertarPresupuesto(presupuesto)
    saveData(presupuesto)
}

function addGasto(e){
    e.preventDefault()

    //Obtener datos
    const nombre = document.getElementById('gasto').value
    let cantidad =  document.getElementById('cantidad').value;

    if(nombre.trim() === '' || cantidad.trim() === ''){
        ui.mostrarAlerta('Ambos campos son obligarios','error');
        return
    }
    else if(cantidad <=0 || isNaN(cantidad)){
        ui.mostrarAlerta('Cantidad no valida','error')
        return
    }
    cantidad = Number(cantidad)


    const gasto = { nombre,cantidad,id:Date.now() }
    presupuesto.nuevoGasto(gasto)

    ui.mostrarAlerta('Gasto Agregado Correctamente')
    
    setTimeout(()=>{
        formulario.reset()
    },2000)
   
    const {gastos,restante} = presupuesto;
    ui.agregarGastoListado(gastos)
    ui.actualizarRestante(restante)
    ui.alertarRestante(presupuesto)
    // Guardar el objeto antualizado en Localstorage
    saveData(presupuesto)
}

function eliminarGasto(id){
    // Eliminar de la clase
    presupuesto.eliminarGasto(id)

    // Elimina desde el objeto
    const {gastos,restante} = presupuesto
    ui.agregarGastoListado(gastos)
    ui.actualizarRestante(restante)
    ui.alertarRestante(presupuesto)
    saveData(presupuesto)   
}

function saveData(data) {

    // Utilizamos JSON.stringify para serializar los objetos antes de guardarlos
    const jsonData = JSON.stringify(data);
    ls.setItem(PresupuestoOBJ, jsonData);    
}
  