// eslint-disable-next-line
const kolobok = (persName, secondName, thirdName) => {
  switch (persName.toLowerCase()) {
    case 'дедушка':
      return 'Я от дедушки ушёл'
    case 'заяц':
      return 'Я от зайца ушёл'
    case 'лиса':
      return 'Меня съели'
    default:
      throw new Error(`Неверно указан персонаж: '${persName}'`)
  }
}

// eslint-disable-next-line
const newYear = (persName) => `${persName}! `.repeat(3)
