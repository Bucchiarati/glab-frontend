<template>
  <slot name="navigation"></slot>
  <v-card title="Haz tu reservación" class="form">
    <v-form @submit.prevent="submitForm">
      <v-container>
        <v-row>
          <v-col cols="12" sm="6">
            <v-text-field v-model="nombres" :rules="nameRules" label="Nombres" required></v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="apellidos" :rules="surnameRules" label="Apellidos" required></v-text-field>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" sm="6">
            <v-select v-model="tipodocumento" :items="tiposDocumento" label="Tipo de documento" required></v-select>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="identificacion" :rules="idRules" label="Identificación" required></v-text-field>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" sm="6">
            <v-text-field v-model="email" :rules="mailRules" label="Email" required></v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="fechareserva" :rules="dateRules" label="Fecha de reserva" type="date" required></v-text-field>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" sm="6">
            <v-select v-model="tiporeserva" :items="tiposReserva" label="Tipo de reserva" required></v-select>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="cantidadpersonas" :rules="peopleRules" label="Cantidad de personas" type="number" required></v-text-field>
          </v-col>
        </v-row>

        <v-textarea v-model="observaciones" label="Descripción y/o observaciones"></v-textarea>

        <v-btn type="submit" color="secondary">Realizar reserva</v-btn>

      </v-container>
    </v-form>
  </v-card>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ReservacionForm',
  data() {
    return {
      nombres: '',
      nameRules: [
        v => !!v || 'El nombre es requerido',
        v => (v && v.length >= 3) || 'El nombre debe tener más de 3 caracteres',
        v => /^[a-zA-Z]+$/.test(v) || 'El nombre solo puede contener letras'
      ],
      apellidos: '',
      surnameRules: [
        v => !!v || 'El apellido es requerido',
        v => (v && v.length <= 15) || 'El apellido debe tener menos de 15 caracteres',
        v => /^[a-zA-Z]+$/.test(v) || 'El apellido solo puede contener letras'
      ],
      tipodocumento: '',
      tiposDocumento: ['Cédula', 'Pasaporte', 'Tarjeta de Identidad'],
      identificacion: '',
      idRules: [
        v => !!v || 'La identificación es requerida',
        v => (v && v.length == 10) || 'La identificación debe tener al menos 10 caracteres',
        v => /^[0-9]+$/.test(v) || 'La identificación solo puede contener números'
      ],
      email: '',
      mailRules: [
        v => !!v || 'El email es requerido',
        v => /.+@.+\..+/.test(v) || 'El email debe ser válido'
      ],
      fechareserva: '',
      dateRules: [
        v => !!v || 'La fecha de reserva es requerida',
        v => (v >= new Date().toISOString().substr(0, 10)) || 'La fecha de reserva debe ser mayor o igual a la fecha actual'
      ],
      tiporeserva: '',
      tiposReserva: ['Cena', 'Almuerzo', 'Onces', 'Cumpleaños', 'Ocasión Especial'],
      cantidadpersonas: null,
      peopleRules: [
        v => !!v || 'La cantidad de personas es requerida',
        v => (v > 0) || 'La cantidad de personas debe ser mayor a 0',
        v => /^[0-9]+$/.test(v) || 'La cantidad de personas solo puede contener números'
      ],
      observaciones: ''
    };
  },
  methods: {
    submitForm() {
  // Crea un objeto con los datos del formulario
  const formData = {
    nombres: this.nombres,
    apellidos: this.apellidos,
    tipodocumento: this.tipodocumento,
    identificacion: this.identificacion,
    email: this.email,
    fechareserva: this.fechareserva,
    tiporeserva: this.tiporeserva,
    cantidadpersonas: this.cantidadpersonas,
    observaciones: this.observaciones,
    estado: 'Pendiente'
  };

    // Realiza la solicitud POST al backend
    axios.post('http://localhost:3000/api/reservaciones', formData)
    .then(response => {
      alert('Reserva guardada con éxito');
      // Redirecciona a la página de inicio
      this.$router.push('/home');
    })
    .catch(error => {
      console.error('Error al guardar la reserva:', error);
    });
}
  }
};
</script>


<style>
.form {
  max-width: 800px;
  margin: 0 auto;
  margin-top: 30px;
  margin-bottom: 40px;
}

.v-btn {
  margin: 20px;
}

</style>