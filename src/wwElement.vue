<template>
  <div class="calendar-wrapper" :style="containerStyle">
    <div class="calendar-header" :style="headerStyle">
      <div class="month-display" :style="textStyle">{{ currentMonthDisplay }}</div>
      <div class="navigation">
        <button class="nav-btn" @click="prevMonth" aria-label="Mês anterior">
          <span class="arrow left-arrow"></span>
        </button>
        <button class="nav-btn" @click="nextMonth" aria-label="Próximo mês">
          <span class="arrow right-arrow"></span>
        </button>
      </div>
    </div>
    
    <div class="weekdays" :style="weekdaysStyle">
      <div v-for="(day, index) in weekDays" :key="index" class="weekday">{{ day }}</div>
    </div>
    
    <div class="days-grid">
      <div 
        v-for="day in calendarDays" 
        :key="`day-${day.date}`" 
        class="day-cell"
        :class="{
          'other-month': !day.isCurrentMonth,
          'today': day.isToday,
          'has-activities': day.hasActivities,
          'clickable': content.clickAllDays || day.hasActivities,
          'selected': isSelectedDay(day.date)
        }"
        @click="handleDayClick(day)"
      >
        {{ day.dayNumber }}
        <div v-if="day.hasActivities" class="activity-indicator"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    content: { type: Object, required: true },
    uid: { type: String, required: true },
    /* wwEditor:start */
    wwEditorState: { type: Object, required: true },
    /* wwEditor:end */
  },
  emits: ['trigger-event'],
  data() {
    return {
      currentDate: new Date(),
      currentMonth: new Date().getMonth(),
      currentYear: new Date().getFullYear(),
      weekDays: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
      selectedDate: null,
      localActivities: []
    };
  },
  computed: {
    containerStyle() {
      return {
        backgroundColor: this.content.backgroundColor || 'white',
        border: `${this.content.borderWidth || 1}px solid ${this.content.borderColor || '#e0e0e0'}`,
        borderRadius: `${this.content.borderRadius || 8}px`,
      };
    },
    headerStyle() {
      return {
        backgroundColor: this.content.headerBackgroundColor || '#f8f8f8',
        borderBottom: `1px solid ${this.content.borderColor || '#e0e0e0'}`,
      };
    },
    textStyle() {
      return {
        color: this.content.textColor || '#333333',
      };
    },
    weekdaysStyle() {
      return {
        backgroundColor: this.content.headerBackgroundColor || '#f8f8f8',
        borderBottom: `1px solid ${this.content.borderColor || '#e0e0e0'}`,
      };
    },
    
    currentMonthDisplay() {
      const options = { month: 'long', year: 'numeric' };
      return new Date(this.currentYear, this.currentMonth, 1).toLocaleDateString('pt-BR', options);
    },
    
    calendarDays() {
      const activities = this.content.activities || [];
      const today = new Date();
      const firstDayOfMonth = new Date(this.currentYear, this.currentMonth, 1);
      const lastDayOfMonth = new Date(this.currentYear, this.currentMonth + 1, 0);
      const firstDayWeekday = firstDayOfMonth.getDay();
      const daysFromPrevMonth = firstDayWeekday;
      const lastDayOfPrevMonth = new Date(this.currentYear, this.currentMonth, 0).getDate();
      
      const calendarDays = [];
      
      // Dias do mês anterior
      for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
        const date = new Date(this.currentYear, this.currentMonth - 1, lastDayOfPrevMonth - i);
        const dateString = this.formatDateToString(date);
        
        calendarDays.push({
          date: dateString,
          dayNumber: lastDayOfPrevMonth - i,
          isCurrentMonth: false,
          isToday: this.isSameDay(date, today),
          hasActivities: this.hasActivitiesOnDate(activities, dateString),
          activities: this.getActivitiesForDate(activities, dateString)
        });
      }
      
      // Dias do mês atual
      for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
        const date = new Date(this.currentYear, this.currentMonth, i);
        const dateString = this.formatDateToString(date);
        
        calendarDays.push({
          date: dateString,
          dayNumber: i,
          isCurrentMonth: true,
          isToday: this.isSameDay(date, today),
          hasActivities: this.hasActivitiesOnDate(activities, dateString),
          activities: this.getActivitiesForDate(activities, dateString)
        });
      }
      
      // Dias do próximo mês
      const daysToAdd = 42 - calendarDays.length;
      for (let i = 1; i <= daysToAdd; i++) {
        const date = new Date(this.currentYear, this.currentMonth + 1, i);
        const dateString = this.formatDateToString(date);
        
        calendarDays.push({
          date: dateString,
          dayNumber: i,
          isCurrentMonth: false,
          isToday: this.isSameDay(date, today),
          hasActivities: this.hasActivitiesOnDate(activities, dateString),
          activities: this.getActivitiesForDate(activities, dateString)
        });
      }
      
      return calendarDays;
    }
  },
  watch: {
    'content.activities': {
      handler(newActivities) {
        this.localActivities = newActivities || [];
        this.currentMonth = this.currentMonth; // Força atualização
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    isSelectedDay(dateString) {
      return this.selectedDate === dateString;
    },
    
    prevMonth() {
      if (this.currentMonth === 0) {
        this.currentMonth = 11;
        this.currentYear--;
      } else {
        this.currentMonth--;
      }
    },
    
    nextMonth() {
      if (this.currentMonth === 11) {
        this.currentMonth = 0;
        this.currentYear++;
      } else {
        this.currentMonth++;
      }
    },
    
    formatDateToString(date) {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    },
    
    isSameDay(date1, date2) {
      return date1.getFullYear() === date2.getFullYear() && 
             date1.getMonth() === date2.getMonth() &&
             date1.getDate() === date2.getDate();
    },
    
    hasActivitiesOnDate(activities, dateString) {
      const dateField = this.content.dateField || 'date';
      
      return activities.some(activity => {
        if (typeof activity[dateField] === 'string') {
          return activity[dateField] === dateString;
        }
        
        if (activity[dateField] instanceof Date) {
          return this.formatDateToString(activity[dateField]) === dateString;
        }
        
        return false;
      });
    },
    
    getActivitiesForDate(activities, dateString) {
      const dateField = this.content.dateField || 'date';
      
      return activities.filter(activity => {
        if (typeof activity[dateField] === 'string') {
          return activity[dateField] === dateString;
        }
        
        if (activity[dateField] instanceof Date) {
          return this.formatDateToString(activity[dateField]) === dateString;
        }
        
        return false;
      });
    },
    
    // MÉTODO OTIMIZADO QUE GARANTE A EMISSÃO CORRETA DE EVENTOS
    handleDayClick(day) {
      if (this.content.clickAllDays || day.hasActivities) {
        // Armazenar o dia selecionado
        this.selectedDate = day.date;
        
        // Copiar atividades de forma segura para evitar problemas de referência
        const activitiesCopy = [];
        if (day.activities && Array.isArray(day.activities)) {
          day.activities.forEach(activity => {
            activitiesCopy.push({...activity});
          });
        }
        
        // Criar objeto de dados do evento
        const eventData = {
          date: day.date,
          activities: activitiesCopy,
          isCurrentMonth: day.isCurrentMonth,
          dayNumber: day.dayNumber
        };
        
        // Emitir evento no formato EXATO que o WeWeb espera
        this.$emit('trigger-event', {
          name: 'dayClick',
          event: eventData
        });
      }
    }
  }
};
</script>

<style scoped>
.calendar-wrapper {
  font-family: Arial, sans-serif;
  overflow: hidden;
  width: 100%;
  max-width: 350px;
  margin: 0 auto;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
}

.month-display {
  font-weight: bold;
  font-size: 16px;
}

.navigation {
  display: flex;
  gap: 8px;
}

.nav-btn {
  background-color: transparent;
  border: none;
  border-radius: 4px;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.nav-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.arrow {
  border: solid #999;
  border-width: 0 2px 2px 0;
  display: inline-block;
  padding: 3px;
}

.left-arrow {
  transform: rotate(135deg);
}

.right-arrow {
  transform: rotate(-45deg);
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  padding: 10px 0;
}

.weekday {
  font-weight: bold;
  font-size: 14px;
  color: v-bind('content.textColor || "#333"');
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background-color: rgba(0, 0, 0, 0.05);
}

.day-cell {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: v-bind('content.backgroundColor || "white"');
  font-size: 14px;
  color: v-bind('content.textColor || "#333"');
  transition: background-color 0.2s;
  position: relative;
}

.day-cell.clickable {
  cursor: pointer;
}

.day-cell.clickable:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

.day-cell.other-month {
  color: v-bind('content.inactiveTextColor || "#bbb"');
  background-color: v-bind('content.inactiveBackgroundColor || "#f8f8f8"');
}

.day-cell.today {
  background-color: v-bind('content.todayColor || "#4CAF50"');
  color: white;
  font-weight: bold;
}

.day-cell.has-activities {
  position: relative;
}

.day-cell.selected {
  outline: 2px solid v-bind('content.activityColor || "#4CAF50"');
  font-weight: bold;
}

.activity-indicator {
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: v-bind('content.activityColor || "#4CAF50"');
}

.day-cell.other-month .activity-indicator {
  opacity: 0.5;
}
</style>