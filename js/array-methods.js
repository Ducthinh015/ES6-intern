export const users = [
  { id: 1, name: 'An', age: 20, active: true },
  { id: 2, name: 'Bình', age: 17, active: false },
  { id: 3, name: 'Cường', age: 25, active: true }
];

export function getUsersView(mode) {
  if (mode === 'adult') return users.filter(user => user.age >= 18);
  if (mode === 'active') return users.filter(user => user.active);
  if (mode === 'names') return users.map(user => user.name);
  return users;
}

export function totalAge(list) {
  return list.reduce((sum, user) => sum + user.age, 0);
}

export const hasMinor = list => list.some(user => user.age < 18);
export const everyUserHasName = list => list.every(user => Boolean(user.name));
export const findUserById = (list, id) => list.find(user => user.id === id);
