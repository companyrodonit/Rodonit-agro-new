import type { CollectionConfig } from 'payload';
import { bulletsField, orderField, paragraphsField, slugField } from './fields';

/** Хто заходить в адмінку. Олег + за потреби його маркетолог. */
export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Користувач', plural: 'Користувачі' },
  auth: true,
  admin: { useAsTitle: 'email', group: 'Система' },
  fields: [{ name: 'name', type: 'text', label: 'Імʼя' }],
};

/**
 * Медіа. alt обовʼязковий — не з формалізму: без нього картка препарату
 * для скрінрідера і для Google Images виглядає як порожнеча.
 */
export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Файл', plural: 'Медіа' },
  access: { read: () => true },
  admin: { group: 'Система' },
  upload: {
    staticDir: 'public/uploads',
    mimeTypes: ['image/*'],
    imageSizes: [
      { name: 'card', width: 640, height: undefined, position: 'centre' },
      { name: 'hero', width: 1920, height: undefined, position: 'centre' },
    ],
  },
  fields: [{ name: 'alt', type: 'text', required: true, label: 'Опис зображення (alt)' }],
};

/** Категорії препаратів: стимулятори, мікродобрива, фунгіциди, прилипачі. */
export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: { singular: 'Категорія препаратів', plural: 'Категорії препаратів' },
  access: { read: () => true },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'slug', 'order'], group: 'Каталог' },
  fields: [
    { name: 'name', type: 'text', required: true, label: 'Назва' },
    slugField('Адреса фільтра: /preparaty?cat=<слаг>'),
    { name: 'description', type: 'textarea', label: 'Короткий опис' },
    orderField,
  ],
};

/**
 * Препарати — центральна колекція сайту.
 *
 * Регламенти (культура + норма) свідомо живуть тут, а не в культурах:
 * сторінки /kultury/* збираються з цих самих регламентів. Якби норму вносили
 * у двох місцях, вони б розʼїхались уже на другому редагуванні.
 */
export const Products: CollectionConfig = {
  slug: 'products',
  labels: { singular: 'Препарат', plural: 'Препарати' },
  access: { read: () => true },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'featured', 'order'],
    group: 'Каталог',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Основне',
          fields: [
            { name: 'name', type: 'text', required: true, label: 'Повна назва' },
            {
              name: 'shortName',
              type: 'text',
              label: 'Коротка назва',
              admin: { description: 'Для вузьких місць: картки, хлібні крихти' },
            },
            {
              name: 'category',
              type: 'relationship',
              relationTo: 'categories',
              required: true,
              label: 'Категорія',
            },
            { name: 'tagline', type: 'text', label: 'Підзаголовок (одним рядком)' },
            { name: 'description', type: 'textarea', required: true, label: 'Опис для картки' },
            { name: 'image', type: 'upload', relationTo: 'media', label: 'Фото упаковки' },
            bulletsField('packaging', 'Фасування', 'Наприклад: 10 кг, 5 л'),
          ],
        },
        {
          label: 'Сторінка препарату',
          fields: [
            paragraphsField('intro', 'Вступні абзаци'),
            {
              name: 'keySpecs',
              type: 'array',
              label: 'Ключові характеристики (плитки вгорі)',
              admin: { initCollapsed: true },
              fields: [
                { name: 'label', type: 'text', required: true, label: 'Назва' },
                { name: 'value', type: 'text', required: true, label: 'Значення' },
              ],
            },
            {
              name: 'specs',
              type: 'array',
              label: 'Розділи характеристик',
              admin: { initCollapsed: true },
              fields: [
                { name: 'title', type: 'text', required: true, label: 'Заголовок розділу' },
                paragraphsField('body', 'Абзаци'),
              ],
            },
            bulletsField('advantages', 'Переваги'),
            bulletsField('usage', 'Застосування'),
            bulletsField('mixing', 'Приготування розчину'),
            bulletsField('compatibility', 'Сумісність'),
            bulletsField('storage', 'Зберігання'),
          ],
        },
        {
          label: 'Регламент',
          fields: [
            {
              name: 'regulations',
              type: 'array',
              label: 'Норми внесення по культурах',
              admin: {
                description:
                  'З цих рядків будуються сторінки культур. Назву культури пишіть однаково у всіх препаратах — інакше зʼявиться дубль-сторінка.',
              },
              fields: [
                { name: 'culture', type: 'text', required: true, label: 'Культура' },
                { name: 'rate', type: 'text', required: true, label: 'Норма / регламент' },
              ],
            },
          ],
        },
        {
          label: 'Проблеми, які вирішує',
          fields: [
            {
              name: 'problems',
              type: 'array',
              label: 'Проблеми',
              admin: { initCollapsed: true },
              fields: [
                { name: 'title', type: 'text', required: true, label: 'Проблема' },
                paragraphsField('body', 'Пояснення'),
              ],
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            {
              name: 'metaDescription',
              type: 'textarea',
              label: 'Опис для пошуковика (meta description)',
              maxLength: 200,
            },
          ],
        },
      ],
    },
    slugField('Адреса сторінки: /preparaty/<слаг>'),
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Показувати на головній',
      admin: { position: 'sidebar' },
    },
    orderField,
  ],
};

/** Дистрибʼютори — партнерська мережа. */
export const Distributors: CollectionConfig = {
  slug: 'distributors',
  labels: { singular: 'Дистрибʼютор', plural: 'Дистрибʼютори' },
  access: { read: () => true },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'direction', 'order'], group: 'Каталог' },
  fields: [
    { name: 'name', type: 'text', required: true, label: 'Назва компанії' },
    { name: 'logo', type: 'upload', relationTo: 'media', label: 'Логотип' },
    {
      name: 'direction',
      type: 'text',
      required: true,
      label: 'Напрямок',
      admin: {
        description:
          'Фільтр на сторінці дистрибʼюторів: Садівництво, Овочівництво, Технічні культури…',
      },
    },
    { name: 'role', type: 'text', label: 'Роль (підпис під назвою)' },
    {
      name: 'phones',
      type: 'array',
      label: 'Телефони',
      fields: [{ name: 'number', type: 'text', required: true }],
    },
    { name: 'address', type: 'textarea', label: 'Адреса' },
    orderField,
  ],
};

/**
 * Культури. Рядки «препарат + норма» — авторські: у регламентах препаратів
 * культури записані вільним текстом із синонімами, і автоматична збірка
 * сторінки культури з них дала б діри (перевірено: точний збіг лише у 23
 * з 75 рядків). Тому кожна культура тримає власний перелік. Він же живить
 * фільтр каталогу і лічильники на головній.
 */
export const Cultures: CollectionConfig = {
  slug: 'cultures',
  labels: { singular: 'Культура', plural: 'Культури' },
  access: { read: () => true },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'order'],
    group: 'Каталог',
  },
  fields: [
    { name: 'name', type: 'text', required: true, label: 'Назва культури' },
    slugField('Адреса сторінки: /kultury/<слаг>'),
    { name: 'intro', type: 'textarea', label: 'Вступний текст' },
    {
      name: 'products',
      type: 'array',
      label: 'Препарати для цієї культури',
      admin: {
        description:
          'Ці рядки показуються на сторінці культури і вмикають культуру у фільтрі каталогу.',
      },
      fields: [
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
          required: true,
          label: 'Препарат',
        },
        {
          name: 'rate',
          type: 'textarea',
          label: 'Норма для цієї культури',
          admin: { description: 'Порожньо — покажемо «норма уточнюється у консультанта»' },
        },
      ],
    },
    orderField,
  ],
};

/** «Рішення» — типові проблеми поля і препарати під них. */
export const Solutions: CollectionConfig = {
  slug: 'solutions',
  labels: { singular: 'Рішення', plural: 'Рішення' },
  access: { read: () => true },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'slug', 'order'], group: 'Контент' },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Заголовок' },
    slugField('Адреса сторінки: /rishennia/<слаг>'),
    { name: 'lead', type: 'textarea', required: true, label: 'Лід' },
    paragraphsField('paragraphs', 'Текст'),
    {
      name: 'products',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      label: 'Препарати під це рішення',
    },
    orderField,
  ],
};

/**
 * Рубрики блогу. Новини — це рубрика, а не окрема колекція:
 * один розділ /blog накопичує вагу в пошуку, два розділи ділять її навпіл.
 */
export const BlogCategories: CollectionConfig = {
  slug: 'blog-categories',
  labels: { singular: 'Рубрика блогу', plural: 'Рубрики блогу' },
  access: { read: () => true },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'slug', 'order'], group: 'Блог' },
  fields: [
    { name: 'name', type: 'text', required: true, label: 'Назва рубрики' },
    slugField('Адреса: /blog/category/<слаг>'),
    { name: 'description', type: 'textarea', label: 'Опис рубрики (шапка сторінки)' },
    orderField,
  ],
};

/** Статті блогу. */
export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: { singular: 'Стаття', plural: 'Статті' },
  access: { read: () => true },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'date', 'published'],
    group: 'Блог',
  },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Заголовок' },
    slugField('Адреса статті: /blog/<слаг>'),
    { name: 'excerpt', type: 'textarea', required: true, label: 'Короткий опис' },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'blog-categories',
      required: true,
      label: 'Рубрика',
    },
    { name: 'cover', type: 'upload', relationTo: 'media', label: 'Обкладинка' },
    { name: 'date', type: 'date', label: 'Дата публікації' },
    {
      name: 'readMinutes',
      type: 'number',
      label: 'Час читання, хв',
      admin: { description: 'Лишіть порожнім — порахується з обсягу тексту' },
    },
    {
      name: 'tags',
      type: 'array',
      label: 'Теги',
      admin: { initCollapsed: true },
      fields: [
        { name: 'label', type: 'text', required: true, label: 'Підпис' },
        { name: 'slug', type: 'text', required: true, label: 'Слаг' },
        {
          name: 'kind',
          type: 'select',
          required: true,
          defaultValue: 'product',
          label: 'Тип',
          options: [
            { label: 'Препарат', value: 'product' },
            { label: 'Культура', value: 'culture' },
          ],
        },
      ],
    },
    {
      name: 'blocks',
      type: 'array',
      label: 'Тіло статті',
      admin: { description: 'Блоки йдуть у тому порядку, у якому стоять тут' },
      fields: [
        {
          name: 'kind',
          type: 'select',
          required: true,
          defaultValue: 'paragraph',
          label: 'Тип блоку',
          options: [
            { label: 'Абзац', value: 'paragraph' },
            { label: 'Підзаголовок', value: 'heading' },
            { label: 'Список', value: 'list' },
          ],
        },
        {
          name: 'text',
          type: 'textarea',
          label: 'Текст',
          admin: { condition: (_, sibling) => sibling?.kind !== 'list' },
        },
        {
          name: 'items',
          type: 'array',
          label: 'Пункти списку',
          admin: { condition: (_, sibling) => sibling?.kind === 'list' },
          fields: [{ name: 'text', type: 'text', required: true }],
        },
      ],
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: true,
      label: 'Опубліковано',
      admin: { position: 'sidebar' },
    },
  ],
};

export const collections: CollectionConfig[] = [
  Users,
  Media,
  Categories,
  Products,
  Cultures,
  Solutions,
  Distributors,
  BlogCategories,
  Posts,
];
