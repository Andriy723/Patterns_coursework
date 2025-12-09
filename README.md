# 🏭 Система складського обліку

Веб-додаток для управління складом з повним функціоналом обліку товарів, постачальників, руху товарів та генерації звітів.

## 📋 Зміст

- [Технології](#технології)
- [Функціонал](#функціонал)
- [Архітектура](#архітектура)
- [Design Patterns](#design-patterns)
- [Встановлення та запуск](#встановлення-та-запуск)
- [Структура проекту](#структура-проекту)
- [Діаграми](#діаграми)

## 🛠 Технології

### Backend
- **Node.js** + **TypeScript**
- **Express.js** - веб-фреймворк
- **MySQL** - база даних
- **JWT** - аутентифікація
- **bcrypt** - хешування паролів

### Frontend
- **Next.js 14** (App Router)
- **React** + **TypeScript**
- **Axios** - HTTP клієнт

## ✨ Функціонал

### Ролі користувачів

#### 👤 USER (Користувач)
- Перегляд товарів (без цін)
- Перегляд залишків на складі
- Перегляд статусу складу

#### 👨‍💼 ADMIN (Адміністратор)
- Повний CRUD для товарів
- Управління рухом товарів (надходження, відвантаження, списання)
- Перегляд постачальників
- Перегляд статистики складу
- Створення та управління накладними та актами
- Перегляд документів

#### 👑 SUPER_ADMIN (Супер Адміністратор)
- Весь функціонал ADMIN
- Управління адміністраторами (створення, деактивація, активація)
- Управління користувачами
- Управління постачальниками (CRUD, видалення)
- Управління контрагентами (CRUD)
- Створення та управління накладними та актами
- Підтвердження та скасування документів
- Генерація звітів:
  - Статус складу на дату
  - Динаміка руху товарів
  - Фінансовий звіт

### Основні можливості

- ✅ Реєстрація товарів (назва, артикул, кількість, ціна, постачальник)
- ✅ Відстеження руху товарів (надходження, відвантаження, списання)
- ✅ Контроль залишків на складі
- ✅ Автоматичні сповіщення про низький запас
- ✅ Генерація звітів
- ✅ Облік постачальників та контрагентів
- ✅ Формування накладних та актів
- ✅ Зв'язок постачальників з контрагентами
- ✅ Рольова система доступу

## 🏗 Архітектура

Проект розділений на два основні модулі:

```
Patterns_coursework/
├── backend/          # Node.js + Express API
│   ├── src/
│   │   ├── api/      # REST API endpoints
│   │   ├── services/ # Бізнес-логіка
│   │   ├── patterns/ # Design Patterns
│   │   ├── models/   # Інтерфейси та типи
│   │   └── database.ts
│   └── package.json
│
└── frontend/         # Next.js додаток
    ├── app/          # Pages та layouts
    ├── components/   # React компоненти
    ├── lib/          # Утиліти та API клієнт
    └── package.json
```

## 🎯 Design Patterns

Проект використовує 4 класичні GoF (Gang of Four) патерни проектування:

### 1. 🔔 Observer Pattern (Спостерігач)

**Призначення:** Реалізує механізм підписки для сповіщення множини об'єктів про зміни стану.

**У коді:**
- **`StockAlertSubject`** - Subject (суб'єкт), який зберігає список спостерігачів
- **`NotificationObserver`** - інтерфейс спостерігача
- **Конкретні спостерігачі:**
  - `DatabaseNotificationObserver` - зберігає алерти в БД
  - `LoggerNotificationObserver` - логує алерти в консоль
  - `EmailNotificationObserver` - для майбутньої реалізації email-сповіщень

**Використання:**
```typescript
// backend/src/services/notificationService.ts
this.alertSubject.attach(new DatabaseNotificationObserver());
this.alertSubject.attach(new LoggerNotificationObserver());
this.alertSubject.notifyAll(alert); // Сповіщає всіх спостерігачів
```

**Для чого:** Коли товар досягає мінімального запасу, система автоматично створює алерт і сповіщає всіх зареєстрованих спостерігачів (БД, логер, майбутні email-сповіщення) без жорсткої зв'язаності між компонентами.

**Загальне призначення:** Дозволяє об'єктам сповіщати інші об'єкти про зміни стану, забезпечуючи слабку зв'язаність між видавцем і підписниками.

---

### 2. 🏭 Singleton Pattern (Одиночка)

**Призначення:** Гарантує, що клас має лише один екземпляр і надає глобальну точку доступу до нього.

**У коді:**
- **`NotificationManager`** - клас з приватним конструктором та статичним методом `getInstance()`

**Використання:**
```typescript
// backend/src/patterns/singleton.ts
const manager = NotificationManager.getInstance();
manager.notify(alert);
manager.subscribe(callback);
```

**Для чого:** Забезпечує єдину точку доступу до менеджера сповіщень по всьому додатку. Всі компоненти використовують той самий екземпляр, що дозволяє централізовано керувати підписками та кешем алертів.

**Загальне призначення:** Використовується, коли потрібен рівно один екземпляр класу (логери, пули з'єднань, кеші, конфігурації).

---

### 3. 🎯 Strategy Pattern (Стратегія)

**Призначення:** Визначає сімейство алгоритмів, інкапсулює кожен з них і робить їх взаємозамінними.

**У коді:**
- **`ReportStrategy`** - інтерфейс стратегії
- **Конкретні стратегії:**
  - `WarehouseStatusReportStrategy` - звіт про статус складу
  - `MovementDynamicsReportStrategy` - звіт про динаміку руху товарів
  - `FinancialReportStrategy` - фінансовий звіт
- **`ReportContext`** - контекст, який використовує стратегію

**Використання:**
```typescript
// backend/src/api/reports.ts
const context = new ReportContext();
context.setStrategy(new FinancialReportStrategy());
const report = await context.executeReport(date);
```

**Для чого:** Дозволяє динамічно вибирати алгоритм генерації звіту залежно від типу звіту. Клієнтський код не залежить від конкретної реалізації - він працює з інтерфейсом `ReportStrategy`.

**Загальне призначення:** Використовується, коли є кілька способів виконання однієї задачі, і потрібна можливість вибору алгоритму під час виконання програми.

---

### 4. 🏗 Factory Pattern (Фабрика)

**Призначення:** Надає інтерфейс для створення об'єктів без вказівки їх конкретних класів.

**У коді:**
- **`MovementProcessor`** - абстрактний клас обробника руху
- **Конкретні обробники:**
  - `IncomeMovementProcessor` - обробка надходження
  - `OutcomeMovementProcessor` - обробка відвантаження
  - `WriteOffMovementProcessor` - обробка списання
- **`MovementProcessorFactory`** - фабрика для створення обробників

**Використання:**
```typescript
// backend/src/services/warehouseService.ts
const processor = MovementProcessorFactory.createProcessor(type);
const movement = await processor.process(productId, quantity, documentNumber);
```

**Для чого:** Інкапсулює логіку створення обробників руху товарів. Замість того, щоб створювати об'єкти напряму в коді, використовується фабрика, яка повертає правильний обробник залежно від типу операції (INCOME, OUTCOME, WRITE_OFF).

**Загальне призначення:** Спрощує створення об'єктів, приховуючи складну логіку ініціалізації та дозволяючи додавати нові типи без зміни існуючого коду.

---

## 🚀 Встановлення та запуск

### Вимоги
- Node.js 18+
- MySQL 8+
- npm або yarn

### Крок 1: Клонування репозиторію
```bash
git clone <repository-url>
cd Patterns_coursework
```

### Крок 2: Налаштування Backend

```bash
cd backend
npm install
```

Створіть файл `.env` в папці `backend/`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=warehouse_db
PORT=3001
JWT_SECRET=your_secret_key
SUPER_ADMIN_EMAIL=admin@warehouse.local
SUPER_ADMIN_PASSWORD=Admin123!
DEFAULT_USER_EMAIL=user1@warehouse.local
DEFAULT_USER_PASSWORD=User123!
```

Запустіть backend:
```bash
npm run dev
```

### Крок 3: Налаштування Frontend

```bash
cd frontend
npm install
```

Створіть файл `.env.local` в папці `frontend/`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Запустіть frontend:
```bash
npm run dev
```

### Крок 4: Доступ до додатку

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### Дефолтні облікові записи

**Super Admin:**
- Email: `admin@warehouse.local`
- Password: `Admin123!`

**User:**
- Email: `user1@warehouse.local`
- Password: `User123!`

## 📁 Структура проекту

```
Patterns_coursework/
├── backend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── auth.ts          # Аутентифікація та авторизація
│   │   │   ├── products.ts       # CRUD товарів
│   │   │   ├── suppliers.ts     # CRUD постачальників
│   │   │   ├── warehouse.ts      # Операції зі складом
│   │   │   ├── documents.ts      # CRUD документів (накладні, акти)
│   │   │   ├── counterparties.ts # CRUD контрагентів
│   │   │   └── reports.ts        # Генерація звітів
│   │   ├── services/
│   │   │   ├── productService.ts
│   │   │   ├── warehouseService.ts
│   │   │   ├── notificationService.ts
│   │   │   ├── documentService.ts
│   │   │   ├── counterpartyService.ts
│   │   │   └── supplierService.ts
│   │   ├── patterns/
│   │   │   ├── observer.ts       # Observer Pattern
│   │   │   ├── singleton.ts      # Singleton Pattern
│   │   │   ├── strategy.ts       # Strategy Pattern
│   │   │   └── factory.ts        # Factory Pattern
│   │   ├── models/
│   │   │   └── entities.ts       # TypeScript інтерфейси
│   │   ├── database.ts           # Ініціалізація БД
│   │   └── server.ts              # Express сервер
│   └── package.json
│
└── frontend/
    ├── app/
    │   ├── page.tsx               # Головна сторінка
    │   ├── layout.tsx             # Root layout
    │   ├── products/              # Сторінки товарів (для USER)
    │   ├── user/
    │   │   └── login/            # Логін користувача
    │   └── admin/
    │       ├── layout.tsx         # Admin layout
    │       ├── login/             # Логін адміна
    │       ├── page.tsx           # Admin dashboard
    │       ├── products/          # Управління товарами
    │       ├── suppliers/         # Управління постачальниками
    │       ├── documents/        # Управління накладними та актами
    │       ├── counterparties/    # Управління контрагентами
    │       ├── warehouse/          # Управління складом
    │       ├── admins/            # Управління адмінами
    │       ├── users/             # Управління користувачами
    │       └── reports/           # Звіти
    ├── components/
    │   ├── Navigation.tsx         # Навігація для публічних сторінок
    │   ├── UserNavigation.tsx     # Навігація для користувачів
    │   ├── Modal.tsx              # Модальні вікна
    │   └── ConfirmationModal.tsx   # Модальні вікна підтвердження
    ├── lib/
    │   └── api.ts                 # API клієнт
    └── package.json
```

## 📊 Діаграми

### Use Cases Діаграма

```plantuml
@startuml

left to right direction

actor "👤 Користувач" as User
actor "👨‍💼 Адміністратор" as Admin
actor "👑 Супер Адміністратор" as SuperAdmin

rectangle "Система складського обліку" {
    usecase "Перегляд товарів" as UC1
    usecase "Перегляд залишків складу" as UC2
    usecase "Управління товарами" as UC3
    usecase "Управління рухом товарів" as UC4
    usecase "Створення накладних та актів" as UC5
    usecase "Управління постачальниками" as UC6
    usecase "Управління контрагентами" as UC7
    usecase "Генерація звітів" as UC8
    usecase "Управління користувачами" as UC9
    usecase "Управління адміністраторами" as UC10
    
    usecase "Автентифікуватися" as INC1
    
    usecase "Згенерувати номер документа" as EXT1
    usecase "Сповістити про низький запас" as EXT2
}

User --> UC1
User --> UC2

Admin --> UC1
Admin --> UC2
Admin --> UC3
Admin --> UC4
Admin --> UC5

SuperAdmin --> UC3
SuperAdmin --> UC4
SuperAdmin --> UC5
SuperAdmin --> UC6
SuperAdmin --> UC7
SuperAdmin --> UC8
SuperAdmin --> UC9
SuperAdmin --> UC10

UC1 ..> INC1 : <<include>>
UC2 ..> INC1 : <<include>>
UC3 ..> INC1 : <<include>>
UC4 ..> INC1 : <<include>>
UC5 ..> INC1 : <<include>>
UC6 ..> INC1 : <<include>>
UC7 ..> INC1 : <<include>>
UC8 ..> INC1 : <<include>>
UC9 ..> INC1 : <<include>>
UC10 ..> INC1 : <<include>>

UC3 ..> UC1 : <<extend>>
UC4 ..> UC1 : <<extend>>
UC5 ..> UC1 : <<extend>>
EXT1 ..> UC5 : <<extend>>
EXT2 ..> UC1 : <<extend>>

@enduml
```

### UML Діаграма класів

```plantuml
@startuml

class Product {
    - id: String
    - name: String
    - article: String
    - quantity: Number
    - price: Number
    - supplierId: String
    - minStock: Number
    - createdAt: Date
    - updatedAt: Date
    + updateQuantity(amount: Number): void
    + checkLowStock(): Boolean
    + calculateTotalValue(): Number
    + isAvailable(requiredQuantity: Number): Boolean
    # validateQuantity(amount: Number): Boolean
}

class Supplier {
    - id: String
    - counterpartyId: String
    - name: String
    - phone: String
    - email: String
    - address: String
    - createdAt: Date
    - updatedAt: Date
    + getFullInfo(): String
    + updateContactInfo(phone, email, address): void
    # validateEmail(email: String): Boolean
}

class Counterparty {
    - id: String
    - name: String
    - phone: String
    - email: String
    - address: String
    - taxId: String
    - type: String
    - createdAt: Date
    - updatedAt: Date
    + getFullInfo(): String
    + validateTaxId(): Boolean
    # formatTaxId(): String
}

class Document {
    - id: String
    - documentNumber: String
    - type: String
    - documentDate: Date
    - supplierId: String
    - counterpartyId: String
    - totalAmount: Number
    - status: String
    - createdBy: String
    - createdAt: Date
    - updatedAt: Date
    + calculateTotal(): Number
    + confirm(): void
    + cancel(): void
    + addItem(item: DocumentItem): void
    + removeItem(itemId: String): void
    + isConfirmed(): Boolean
    # validateStatus(): Boolean
    # updateTotalAmount(): void
}

class DocumentItem {
    - id: String
    - documentId: String
    - productId: String
    - quantity: Number
    - price: Number
    - total: Number
    - notes: String
    - createdAt: Date
    + calculateTotal(): Number
    + updateQuantity(quantity: Number): void
    + updatePrice(price: Number): void
    # validateQuantity(): Boolean
}

class WarehouseMovement {
    - id: String
    - productId: String
    - type: String
    - quantity: Number
    - date: Date
    - documentNumber: String
    - notes: String
    - createdAt: Date
    + execute(): void
    + getMovementType(): String
    # validateMovement(): Boolean
}

class StockAlert {
    - id: String
    - productId: String
    - message: String
    - isRead: Boolean
    - createdAt: Date
    + markAsRead(): void
    + isUnread(): Boolean
    # generateMessage(): String
}

class User {
    - id: String
    - email: String
    - password: String
    - name: String
    - role: String
    - isActive: Boolean
    - createdAt: Date
    - updatedAt: Date
    + authenticate(password: String): Boolean
    + hasPermission(action: String): Boolean
    + isAdmin(): Boolean
    + isSuperAdmin(): Boolean
    # hashPassword(password: String): String
    # validateRole(): Boolean
}

' Relationships between entities
Product "0..*" o-- "0..1" Supplier : supplierId
Supplier "0..*" o-- "0..1" Counterparty : counterpartyId
Document "1" *-- "1..*" DocumentItem : композиція
Document "0..*" --> "0..1" Supplier : supplierId
Document "0..*" --> "0..1" Counterparty : counterpartyId
Document "0..*" --> "0..1" User : createdBy
DocumentItem "1..*" --> "1" Product : productId
Product "1" --> "0..*" WarehouseMovement : productId
Product "1" --> "0..*" StockAlert : productId
Document "1" --> "0..*" WarehouseMovement : documentNumber

@enduml
```

## 📝 Примітки

- Всі паролі хешуються за допомогою bcrypt
- JWT токени використовуються для аутентифікації
- База даних автоматично ініціалізується при першому запуску
- Система автоматично створює дефолтні облікові записи при ініціалізації

## 📄 Ліцензія

Цей проект створено в навчальних цілях.
