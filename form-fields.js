export const formFields = [
  {
    header: "Выберите тип вашего учреждения из списка ниже",
    type: "radio",
    name: "type",
    options: ["Санаторий", "Детский оздоровительный лагерь", "Дом отдыха", "Реабилитационный центр"],
  },
  {
    header: "Выберите тип отдыхающих",
    type: "radio",
    name: "people",
    options: ["Взрослые", "Дети", "Все вместе"],
    showIf: (formData) => formData.type !== "Детский оздоровительный лагерь",
  },
  {
    header: "Выберите возраст детей",
    type: "radio",
    name: "age",
    options: ["1-2 года", "4-7 лет", "8-11 лет", "12-18 лет"],
    showIf: (formData) => formData.people === "Дети" || formData.people === "Все вместе" || formData.type === "Детский оздоровительный лагерь",
  },
  {
    header: "Выберите диету",
    type: "radio",
    name: "food_group",
    options: ["Обычный стол без диеты", "Диетический стол №1", "Диетический стол №2", "Диетический стол №3"],
  },
  {
    header: "Выберите блюда, которые вы хотите видеть в меню",
    type: "checkbox",
    name: "menu",
    blocks: [
      {
        categoryHeader: "Каши",
        categoryName: "kashi",
        items: ["Перловая", "Геркулес", "Манная", "Гречневая"]
      },
      {
        categoryHeader: "Закуски",
        categoryName: "snacks",
        items: ["Паштет печоночный", "Белужья зернистая", "Кеты зернистая", "Фасоль консервы"]
      },
      {
        categoryHeader: "Напитки",
        categoryName: "drinks",
        items: ["Кофе", "Чай", "Сок", "Вода"]
      },
    ]
  }
];
