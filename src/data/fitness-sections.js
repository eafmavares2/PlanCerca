export const HOME_TABS = [
  { id: 'home', label: 'Inicio', icon: 'home-outline' },
  { id: 'strength', label: 'Fuerza', icon: 'barbell-outline' },
  { id: 'nutrition', label: 'Nutrición', icon: 'restaurant-outline' },
  { id: 'hydration', label: 'Agua', icon: 'water-outline' },
  { id: 'cardio', label: 'Cardio', icon: 'flash-outline' },
];

export const INITIAL_SECTION_RECORDS = {
  strength: [
    { id: 'strength-1', title: 'Press banca', description: '4 series de 8 repeticiones', target: 'Tren superior' },
    { id: 'strength-2', title: 'Dominadas', description: '4 series de 6 repeticiones', target: 'Espalda' },
    { id: 'strength-3', title: 'Press militar', description: '3 series de 10 repeticiones', target: 'Hombros' },
  ],
  nutrition: [
    { id: 'nutrition-1', title: 'Proteína en cada comida', description: 'Incluye una fuente de proteína en tus comidas principales.', target: 'Hábito' },
    { id: 'nutrition-2', title: 'Frutas y verduras', description: 'Añade variedad de frutas y verduras a tu alimentación.', target: 'Hábito' },
    { id: 'nutrition-3', title: 'Porciones del día', description: 'Organiza las porciones de acuerdo con tu objetivo personal.', target: 'Plan diario' },
  ],
  hydration: [
    { id: 'hydration-1', title: 'Agua al despertar', description: 'Empieza el día con un vaso de agua.', target: '1 vaso' },
    { id: 'hydration-2', title: 'Pausa de hidratación', description: 'Toma agua con regularidad durante el día.', target: 'Cada 2 horas' },
    { id: 'hydration-3', title: 'Después de entrenar', description: 'Repón líquidos después de la actividad física.', target: 'Al terminar' },
  ],
  cardio: [
    { id: 'cardio-1', title: 'Calentamiento', description: 'Prepara el cuerpo antes de los intervalos.', target: '4 minutos' },
    { id: 'cardio-2', title: 'Intervalos HIIT', description: 'Alterna esfuerzo y recuperación a tu propio ritmo.', target: '40 s / 20 s' },
    { id: 'cardio-3', title: 'Vuelta a la calma', description: 'Baja la intensidad gradualmente al finalizar.', target: '4 minutos' },
  ],
};

export const SECTION_DETAILS = {
  strength: 'Administra ejercicios y series de fuerza.',
  nutrition: 'Organiza hábitos y notas de alimentación.',
  hydration: 'Lleva una lista de tus recordatorios de agua.',
  cardio: 'Planifica intervalos y sesiones cardiovasculares.',
};
