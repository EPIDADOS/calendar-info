export default {
  editor: {
    label: {
      en: 'Calendar with Events',
      pt: 'Calendário com Eventos',
    },
    icon: 'fa fa-calendar',
  },
  properties: {
    // CONFIGURAÇÃO DE DADOS
    activities: {
      label: {
        en: 'Activities/Events',
        pt: 'Atividades/Eventos',
      },
      type: 'Array',
      bindable: true,
      defaultValue: [
        { date: '2025-03-04', title: 'Meeting' },
        { date: '2025-03-10', title: 'Conference' },
        { date: '2025-03-13', title: 'Important Event', selected: true },
        { date: '2025-03-18', title: 'Team Building' },
        { date: '2025-03-22', title: 'Deadline' },
        { date: '2025-03-25', title: 'Review' },
        { date: '2025-03-26', title: 'Presentation' },
      ],
      section: 'Data',
    },
    dateField: {
      label: {
        en: 'Date Field Name',
        pt: 'Nome do Campo de Data',
      },
      type: 'Text',
      defaultValue: 'date',
      section: 'Data',
      multiLang: false,
    },
    clickAllDays: {
      label: {
        en: 'Enable Click on All Days',
        pt: 'Habilitar Clique em Todos os Dias',
      },
      type: 'OnOff',
      defaultValue: true,
      section: 'Interaction',
    },

    // APARÊNCIA
    backgroundColor: {
      label: {
        en: 'Background Color',
        pt: 'Cor de Fundo',
      },
      type: 'Color',
      defaultValue: '#ffffff',
      section: 'Appearance',
    },
    borderWidth: {
      label: {
        en: 'Border Width',
        pt: 'Espessura da Borda',
      },
      type: 'Number',
      options: {
        min: 0,
        max: 5,
        step: 1,
      },
      defaultValue: 1,
      section: 'Appearance',
    },
    borderColor: {
      label: {
        en: 'Border Color',
        pt: 'Cor da Borda',
      },
      type: 'Color',
      defaultValue: '#e0e0e0',
      section: 'Appearance',
    },
    borderRadius: {
      label: {
        en: 'Border Radius',
        pt: 'Raio da Borda',
      },
      type: 'Number',
      options: {
        min: 0,
        max: 20,
        step: 1,
      },
      defaultValue: 8,
      section: 'Appearance',
    },

    // ESTILO DO CABEÇALHO
    headerBackgroundColor: {
      label: {
        en: 'Header Background Color',
        pt: 'Cor de Fundo do Cabeçalho',
      },
      type: 'Color',
      defaultValue: '#f8f8f8',
      section: 'Header',
    },

    // ESTILO DO TEXTO
    textColor: {
      label: {
        en: 'Text Color',
        pt: 'Cor do Texto',
      },
      type: 'Color',
      defaultValue: '#333333',
      section: 'Typography',
    },
    inactiveTextColor: {
      label: {
        en: 'Inactive Days Text Color',
        pt: 'Cor do Texto para Dias Inativos',
      },
      type: 'Color',
      defaultValue: '#bbbbbb',
      section: 'Typography',
    },

    // ESTILO DOS DIAS
    inactiveBackgroundColor: {
      label: {
        en: 'Inactive Days Background',
        pt: 'Fundo para Dias Inativos',
      },
      type: 'Color',
      defaultValue: '#f8f8f8',
      section: 'Days',
    },
    todayColor: {
      label: {
        en: 'Today Highlight Color',
        pt: 'Cor de Destaque para Hoje',
      },
      type: 'Color',
      defaultValue: '#4CAF50',
      section: 'Days',
    },

    // ESTILO DAS ATIVIDADES
    activityColor: {
      label: {
        en: 'Activity Indicator Color',
        pt: 'Cor do Indicador de Atividade',
      },
      type: 'Color',
      defaultValue: '#4CAF50',
      section: 'Events',
    },
  },
  triggerEvents: [
    {
      name: 'dayClick',
      label: {
        en: 'Day Clicked',
        pt: 'Dia Clicado',
      },
      event: {
        date: 'string',
        activities: 'array',
        isCurrentMonth: 'boolean',
        dayNumber: 'number',
      },
      description: {
        en: 'Triggered when a calendar day is clicked',
        pt: 'Acionado quando um dia do calendário é clicado',
      },
    },
  ],
  actions: [
    {
      name: 'goToToday',
      label: {
        en: 'Go to Today',
        pt: 'Ir para Hoje',
      },
      action: `;
const today = new Date();
this.currentMonth = today.getMonth();
this.currentYear = today.getFullYear();
`,
    },
    {
      name: 'goToDate',
      label: {
        en: 'Go to Date',
        pt: 'Ir para Data',
      },
      params: [
        {
          name: 'date',
          type: 'string',
          label: {
            en: 'Date (YYYY-MM-DD)',
            pt: 'Data (AAAA-MM-DD)',
          },
          required: true,
        },
      ],
      action: `;
try {
  const date = new Date(params.date);
  if (!isNaN(date.getTime())) {
    this.currentMonth = date.getMonth();
    this.currentYear = date.getFullYear();
  }
} catch (e) {
  console.error('Invalid date format. Use YYYY-MM-DD');
}
`,
    },
    {
      name: 'selectDay',
      label: {
        en: 'Select Day',
        pt: 'Selecionar Dia',
      },
      params: [
        {
          name: 'date',
          type: 'string',
          label: {
            en: 'Date (YYYY-MM-DD)',
            pt: 'Data (AAAA-MM-DD)',
          },
          required: true,
        },
      ],
      action: `;
this.selectedDate = params.date;
`,
    },
  ],
  getters: {
    allActivities: {
      label: {
        en: 'All Activities',
        pt: 'Todas as Atividades',
      },
      description: {
        en: 'Returns all activities in the calendar',
        pt: 'Retorna todas as atividades no calendário',
      },
      getter: 'return this.content.activities || [];',
    },
    selectedDayActivities: {
      label: {
        en: 'Selected Day Activities',
        pt: 'Atividades do Dia Selecionado',
      },
      description: {
        en: 'Returns activities for the currently selected day',
        pt: 'Retorna atividades para o dia atualmente selecionado',
      },
      getter: `
        if (!this.selectedDate) return [];
        return this.getActivitiesForDate(this.content.activities || [], this.selectedDate) || [];
      `,
    },
  },
  framework: {
    name: 'vue3',
    version: '3.0',
  },
};
