export type Locale = 'ru' | 'en';

export type Dictionary = {
  metaDescription: string;
  prefs: { theme: string; system: string; light: string; dark: string; language: string };
  auth: {
    loginTitle: string;
    loginHint: string;
    registerTitle: string;
    registerHint: string;
    name: string;
    email: string;
    password: string;
    signIn: string;
    signUp: string;
    signInFailed: string;
    signUpFailed: string;
    toRegister: string;
    toLogin: string;
  };
  home: {
    title: string;
    greeting: string;
    empty: string;
    newOrg: string;
    back: string;
    name: string;
    nameError: string;
    create: string;
  };
  nav: { deals: string; contacts: string; members: string; audit: string };
  signOut: string;
  org: { title: string; open: string; hint: string };
  stages: { lead: string; negotiation: string; won: string };
  roles: { owner: string; manager: string; viewer: string };
  deals: {
    title: string;
    hint: string;
    newDeal: string;
    titleField: string;
    amount: string;
    contact: string;
    noContact: string;
    check: string;
    create: string;
    drag: string;
    back: string;
    fields: string;
    checkFields: string;
    save: string;
    notes: string;
    noNotes: string;
    note: string;
    emptyNote: string;
    addNote: string;
    tasks: string;
    noTasks: string;
    task: string;
    emptyTask: string;
    addTask: string;
    done: string;
    undo: string;
  };
  contacts: {
    title: string;
    hint: string;
    empty: string;
    noDetails: string;
    newContact: string;
    name: string;
    email: string;
    phone: string;
    nameError: string;
    emailError: string;
    add: string;
  };
  members: {
    title: string;
    hint: string;
    lastOwner: string;
    inviteError: string;
    roleOf: string;
    save: string;
    remove: string;
    pending: string;
    invite: string;
    email: string;
    role: string;
    send: string;
  };
  audit: {
    title: string;
    hint: string;
    empty: string;
    stageChanged: string;
    invited: string;
    roleChanged: string;
    removed: string;
  };
  invite: {
    invalidTitle: string;
    invalidHint: string;
    forEmail: string;
    wrongEmail: string;
    alreadyMember: string;
    login: string;
    register: string;
    accept: string;
    wrongAccount: string;
  };
  errors: { forbidden: string };
};

export const dictionaries: Record<Locale, Dictionary> = {
  ru: {
    metaDescription: 'Сделки, контакты и участники организации',
    prefs: { theme: 'Тема', system: 'Авто', light: 'Свет', dark: 'Тьма', language: 'Язык' },
    auth: {
      loginTitle: 'Вход',
      loginHint: 'Продолжи работу со своими организациями.',
      registerTitle: 'Регистрация',
      registerHint: 'Пароль не короче 8 символов.',
      name: 'Имя',
      email: 'Email',
      password: 'Пароль',
      signIn: 'Войти',
      signUp: 'Зарегистрироваться',
      signInFailed: 'Не удалось войти',
      signUpFailed: 'Не удалось зарегистрироваться',
      toRegister: 'Регистрация',
      toLogin: 'Вход',
    },
    home: {
      title: 'Организации',
      greeting: '{name}, выбери организацию или создай новую.',
      empty: 'Пока нет ни одной организации.',
      newOrg: 'Новая организация',
      back: 'К организациям',
      name: 'Название',
      nameError: 'Название должно быть от 2 до 80 символов.',
      create: 'Создать',
    },
    nav: { deals: 'Сделки', contacts: 'Контакты', members: 'Участники', audit: 'Аудит' },
    signOut: 'Выход',
    org: {
      title: 'Обзор',
      open: 'Организация открыта.',
      hint: 'Сделки, контакты, участники и аудит находятся в меню.',
    },
    stages: { lead: 'Новая', negotiation: 'Переговоры', won: 'Успех' },
    roles: { owner: 'Владелец', manager: 'Менеджер', viewer: 'Наблюдатель' },
    deals: {
      title: 'Сделки',
      hint: 'Перетащи карточку, чтобы сменить стадию.',
      newDeal: 'Новая сделка',
      titleField: 'Название',
      amount: 'Сумма, ₽',
      contact: 'Контакт',
      noContact: 'Без контакта',
      check: 'Проверь название, сумму и контакт.',
      create: 'Создать',
      drag: 'Перетащить',
      back: 'На доску',
      fields: 'Поля',
      checkFields: 'Проверь поля сделки.',
      save: 'Сохранить',
      notes: 'Заметки',
      noNotes: 'Заметок пока нет.',
      note: 'Заметка',
      emptyNote: 'Заметка пустая.',
      addNote: 'Добавить заметку',
      tasks: 'Задачи',
      noTasks: 'Задач пока нет.',
      task: 'Задача',
      emptyTask: 'Укажи название задачи.',
      addTask: 'Добавить задачу',
      done: 'Готово',
      undo: 'Вернуть',
    },
    contacts: {
      title: 'Контакты',
      hint: 'Люди, с которыми связана организация.',
      empty: 'Контактов пока нет.',
      noDetails: 'Без контактов',
      newContact: 'Новый контакт',
      name: 'Имя',
      email: 'Email',
      phone: 'Телефон',
      nameError: 'Укажи имя.',
      emailError: 'Email указан неверно.',
      add: 'Добавить',
    },
    members: {
      title: 'Участники',
      hint: 'Роли и приглашения этой организации.',
      lastOwner: 'Нельзя снять последнего владельца.',
      inviteError: 'Проверь email и роль.',
      roleOf: 'Роль {name}',
      save: 'Сохранить',
      remove: 'Удалить',
      pending: 'Ждут приглашение',
      invite: 'Пригласить',
      email: 'Email',
      role: 'Роль',
      send: 'Пригласить',
    },
    audit: {
      title: 'Аудит',
      hint: 'Новые события сверху.',
      empty: 'Событий пока нет.',
      stageChanged: 'Смена стадии',
      invited: 'Приглашение',
      roleChanged: 'Смена роли',
      removed: 'Удаление участника',
    },
    invite: {
      invalidTitle: 'Приглашение недействительно',
      invalidHint: 'Ссылка истекла или уже принята.',
      forEmail: 'Приглашение для {email}',
      wrongEmail: 'Войди именно этим адресом.',
      alreadyMember: 'Ты уже в этой организации.',
      login: 'Вход',
      register: 'Регистрация',
      accept: 'Принять',
      wrongAccount: 'Сейчас ты вошёл как {current}. Нужен {needed}.',
    },
    errors: { forbidden: 'Недостаточно прав' },
  },
  en: {
    metaDescription: 'Deals, contacts, and people in an organization',
    prefs: { theme: 'Theme', system: 'Auto', light: 'Light', dark: 'Dark', language: 'Language' },
    auth: {
      loginTitle: 'Sign in',
      loginHint: 'Pick up your organizations.',
      registerTitle: 'Create account',
      registerHint: 'Password must be at least 8 characters.',
      name: 'Name',
      email: 'Email',
      password: 'Password',
      signIn: 'Sign in',
      signUp: 'Create account',
      signInFailed: 'Could not sign in',
      signUpFailed: 'Could not create the account',
      toRegister: 'Create account',
      toLogin: 'Sign in',
    },
    home: {
      title: 'Organizations',
      greeting: '{name}, open an organization or create one.',
      empty: 'No organizations yet.',
      newOrg: 'New organization',
      back: 'All organizations',
      name: 'Name',
      nameError: 'Name must be 2 to 80 characters.',
      create: 'Create',
    },
    nav: { deals: 'Deals', contacts: 'Contacts', members: 'Members', audit: 'Audit' },
    signOut: 'Sign out',
    org: {
      title: 'Overview',
      open: 'Organization is open.',
      hint: 'Deals, contacts, members, and the audit log are in the menu.',
    },
    stages: { lead: 'New', negotiation: 'Negotiation', won: 'Won' },
    roles: { owner: 'Owner', manager: 'Manager', viewer: 'Viewer' },
    deals: {
      title: 'Deals',
      hint: 'Drag a card to change its stage.',
      newDeal: 'New deal',
      titleField: 'Title',
      amount: 'Amount, ₽',
      contact: 'Contact',
      noContact: 'No contact',
      check: 'Check the title, amount, and contact.',
      create: 'Create',
      drag: 'Drag',
      back: 'Back to board',
      fields: 'Fields',
      checkFields: 'Check the deal fields.',
      save: 'Save',
      notes: 'Notes',
      noNotes: 'No notes yet.',
      note: 'Note',
      emptyNote: 'The note is empty.',
      addNote: 'Add note',
      tasks: 'Tasks',
      noTasks: 'No tasks yet.',
      task: 'Task',
      emptyTask: 'Enter a task title.',
      addTask: 'Add task',
      done: 'Done',
      undo: 'Reopen',
    },
    contacts: {
      title: 'Contacts',
      hint: 'People connected to this organization.',
      empty: 'No contacts yet.',
      noDetails: 'No email or phone',
      newContact: 'New contact',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      nameError: 'Enter a name.',
      emailError: 'Email looks wrong.',
      add: 'Add',
    },
    members: {
      title: 'Members',
      hint: 'Roles and invitations for this organization.',
      lastOwner: 'The last owner cannot be removed.',
      inviteError: 'Check the email and role.',
      roleOf: 'Role of {name}',
      save: 'Save',
      remove: 'Remove',
      pending: 'Pending invitations',
      invite: 'Invite',
      email: 'Email',
      role: 'Role',
      send: 'Invite',
    },
    audit: {
      title: 'Audit',
      hint: 'Newest events first.',
      empty: 'No events yet.',
      stageChanged: 'Stage change',
      invited: 'Invitation',
      roleChanged: 'Role change',
      removed: 'Member removed',
    },
    invite: {
      invalidTitle: 'Invitation is not valid',
      invalidHint: 'This link expired or was already used.',
      forEmail: 'Invitation for {email}',
      wrongEmail: 'Sign in with this email address.',
      alreadyMember: 'You are already in this organization.',
      login: 'Sign in',
      register: 'Create account',
      accept: 'Accept',
      wrongAccount: 'You are signed in as {current}. This invite needs {needed}.',
    },
    errors: { forbidden: 'Not allowed' },
  },
};

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}
