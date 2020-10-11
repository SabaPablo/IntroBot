require('dotenv').config(); 

const Discord = require("discord.js");
const horarios = require("./horarios.json")

const client = new Discord.Client();
const prefix = ">>";
const prefixIgnore = "!";

let alumnosConsulta= []

client.on("message", function(message) { 
  if (message.author.bot) return;
  if (message.content.startsWith(prefixIgnore)) return;
  if (message.channel.name != "pedido-de-consulta") return;

  if(!message.content.startsWith(prefix) ){
    if(!estaEnHorario()){
      message.reply(`Actualmente no estamos en horario de consulta, si deseas hacer una consulta fuera del horario, puedes hacerlo en el aula vitual`);
    }else{
      alumnosConsulta =  alumnosConsulta.filter( function( e ) {
        return e.nombre !== message.author.username;
    } );

      alumnosConsulta.push(
        new Alumno(message.author.username, new Date())
      )
    }
  }else{
    if(message.member.roles.cache.some(r => r.name === "Profes")){
      const commandBody = message.content.slice(prefix.length);
      const args = commandBody.split(' ');
      const command = args.shift();
      switch(command){
        case "alumnos" : message.reply(listaAlumnos()); break;
        case "cantidad" : message.reply(alumnosConsulta.size); break;
        case "limpiar" : message.reply(limpiarLista()); break;
        case "diaSemana" : message.reply(diaSemana()); break;
        case "help": message.reply(help); break;
        default: message.reply("No es un comando conocido");
      }
    }
  }

});   

const help = 
`

:arrow_right: COMANDOS
  :small_orange_diamond: alumnos
      Devuelve la lista de alumnos
  :small_orange_diamond: cantidad
      Devuelve la cantidad de alumnos que consultaron
  :small_orange_diamond: limpiar
      Limpia la lista de alumnos
  :small_orange_diamond: diaSemana
      Devuelve en que dia de la semana estamos
  :small_orange_diamond: help
      Da los comandos disponibles

`;

function limpiarLista(){
  alumnosConsulta = [];
  return(":ok:")
}


function diaSemana(){
  var dias=["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];
  var dt = new Date();
  return dias[dt.getUTCDay()];    
};

function listaAlumnos(){
  let res = ""
  alumnosConsulta.forEach( alumno =>{
    res+= `${alumno.nombre} ---> ${getDate(alumno.fecha)},
    `;
  });
  return res
}

function getDate(dt ){
    dformat = `${
      dt.getHours().toString().padStart(2, '0')}:${
      dt.getMinutes().toString().padStart(2, '0')} ${
      (dt.getMonth()+1).toString().padStart(2, '0')}/${
      dt.getDate().toString().padStart(2, '0')}/${
      dt.getFullYear().toString().padStart(4, '0')} `
  return dformat
}

function estaEnHorario(){
  let res = false;
  const today = new Date()
  horarios.consultas.forEach(consulta => {
    if((diaSemana() === consulta.dia)&& (today.getHours() >consulta.hora_inicio || 
    (today.getHours() ==consulta.hora_inicio && today.getMinutes() >consulta.minutos_inicio) )
    && today.getHours() <consulta.hora_fin || 
    (today.getHours() ==consulta.hora_fin && today.getMinutes() <consulta.minutos_fin) ){
      res = true;
    }

  });
  return res;
}
class Alumno{
  constructor (nombre, fecha){ 
  this.nombre = nombre 
  this.fecha = fecha
  }
  
}

client.login(process.env.TOKEN);
