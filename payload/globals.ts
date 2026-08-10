import type { GlobalConfig } from 'payload';

/**
 * Головна сторінка. Hero — один, без каруселі: це LCP-блок, а карусель
 * і швидкість псує, і до другого слайда доходять одиниці відсотків відвідувачів.
 * Замість слайдів редагується сам hero — текст, цифри й фонове зображення.
 */
export const Home: GlobalConfig = {
  slug: 'home',
  label: 'Головна сторінка',
  access: { read: () => true },
  admin: { group: 'Контент' },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Перший екран',
          fields: [
            { name: 'eyebrow', type: 'text', label: 'Надзаголовок' },
            {
              name: 'titleBefore',
              type: 'text',
              label: 'Заголовок — звичайна частина',
              admin: { description: 'Перша частина заголовка, темним' },
            },
            {
              name: 'titleAccent',
              type: 'text',
              label: 'Заголовок — виділена частина',
              admin: { description: 'Слово, яке підсвічується салатовим' },
            },
            { name: 'subtitle', type: 'textarea', label: 'Підзаголовок' },
            {
              name: 'background',
              type: 'upload',
              relationTo: 'media',
              label: 'Фонове зображення',
              admin: { description: 'Широке фото, від 1920px. Порожньо — лишиться поточне.' },
            },
            {
              name: 'stats',
              type: 'array',
              label: 'Цифри під заголовком',
              fields: [
                { name: 'value', type: 'text', required: true, label: 'Значення' },
                { name: 'label', type: 'text', required: true, label: 'Підпис' },
              ],
            },
            { name: 'primaryCta', type: 'text', label: 'Кнопка — основна' },
            { name: 'secondaryCta', type: 'text', label: 'Кнопка — друга' },
          ],
        },
        {
          label: 'Про компанію (блок на головній)',
          fields: [
            { name: 'aboutEyebrow', type: 'text', label: 'Надзаголовок' },
            { name: 'aboutTitle', type: 'text', label: 'Заголовок' },
            { name: 'aboutText', type: 'textarea', label: 'Текст' },
            { name: 'aboutLink', type: 'text', label: 'Підпис посилання' },
          ],
        },
        {
          label: 'Чому нам довіряють',
          fields: [
            {
              name: 'trust',
              type: 'array',
              label: 'Картки довіри',
              admin: { description: 'Ілюстрація підбирається за типом картки' },
              fields: [
                { name: 'title', type: 'text', required: true, label: 'Заголовок' },
                { name: 'text', type: 'textarea', required: true, label: 'Опис' },
                {
                  name: 'icon',
                  type: 'select',
                  required: true,
                  label: 'Ілюстрація',
                  options: [
                    { label: 'Сертифікат', value: 'certificate' },
                    { label: 'Органіка', value: 'organic' },
                    { label: 'Мікронізація', value: 'micron' },
                    { label: 'Безпечність', value: 'safe' },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Форма звʼязку',
          fields: [
            { name: 'ctaEyebrow', type: 'text', label: 'Надзаголовок' },
            { name: 'ctaTitle', type: 'text', label: 'Заголовок' },
            { name: 'ctaSubtitle', type: 'text', label: 'Підзаголовок' },
            { name: 'ctaSubmit', type: 'text', label: 'Напис на кнопці' },
            { name: 'ctaLegal', type: 'text', label: 'Дрібний текст під кнопкою' },
          ],
        },
      ],
    },
  ],
};

/**
 * Наскрізні дані: шапка, підвал, контакти. Міняються рідко, але коли
 * міняється телефон — він має мінятись в одному місці, а не в семи шаблонах.
 */
export const Settings: GlobalConfig = {
  slug: 'settings',
  label: 'Контакти й налаштування',
  access: { read: () => true },
  admin: { group: 'Система' },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Контакти',
          fields: [
            { name: 'company', type: 'text', label: 'Назва компанії' },
            {
              name: 'phones',
              type: 'array',
              label: 'Основні телефони',
              admin: {
                description:
                  'Показуються в шапці, бургер-меню і CTA-блоках. Три цілком достатньо.',
              },
              fields: [
                { name: 'label', type: 'text', required: true, label: 'Відділ' },
                { name: 'value', type: 'text', required: true, label: 'Номер як показувати' },
                { name: 'href', type: 'text', required: true, label: 'tel: посилання' },
              ],
            },
            {
              name: 'allPhones',
              type: 'array',
              label: 'Усі телефони (сторінка контактів)',
              fields: [
                { name: 'group', type: 'text', required: true, label: 'Відділ' },
                {
                  name: 'numbers',
                  type: 'array',
                  label: 'Номери',
                  fields: [{ name: 'number', type: 'text', required: true }],
                },
              ],
            },
            { name: 'email', type: 'text', label: 'E-mail' },
            { name: 'address', type: 'textarea', label: 'Адреса' },
            {
              name: 'socials',
              type: 'array',
              label: 'Соцмережі',
              fields: [
                {
                  name: 'name',
                  type: 'select',
                  required: true,
                  label: 'Мережа',
                  options: [
                    { label: 'Facebook', value: 'facebook' },
                    { label: 'Instagram', value: 'instagram' },
                    { label: 'YouTube', value: 'youtube' },
                    { label: 'TikTok', value: 'tiktok' },
                  ],
                },
                { name: 'href', type: 'text', required: true, label: 'Посилання' },
              ],
            },
          ],
        },
        {
          label: 'Меню',
          fields: [
            {
              name: 'nav',
              type: 'array',
              label: 'Головне меню',
              admin: {
                description:
                  'Більше семи пунктів у шапку не влазить — восьмий переносить меню на другий рядок.',
              },
              fields: [
                { name: 'label', type: 'text', required: true, label: 'Підпис' },
                { name: 'href', type: 'text', required: true, label: 'Посилання' },
              ],
            },
            {
              name: 'footerColumns',
              type: 'array',
              label: 'Колонки підвалу',
              admin: { initCollapsed: true },
              fields: [
                { name: 'title', type: 'text', required: true, label: 'Заголовок колонки' },
                {
                  name: 'links',
                  type: 'array',
                  label: 'Посилання',
                  fields: [
                    { name: 'label', type: 'text', required: true },
                    { name: 'href', type: 'text', required: true },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Юридичне',
          fields: [
            { name: 'legalName', type: 'text', label: 'Повна назва юрособи' },
            { name: 'edrpou', type: 'text', label: 'ЄДРПОУ' },
            { name: 'legalAddress', type: 'textarea', label: 'Юридична адреса' },
            { name: 'postalAddress', type: 'textarea', label: 'Поштова адреса' },
            {
              name: 'legalUpdated',
              type: 'text',
              label: 'Дата оновлення документів',
              admin: { description: 'Показується на /privacy і /terms' },
            },
          ],
        },
        {
          label: 'Доставка',
          fields: [
            {
              name: 'delivery',
              type: 'array',
              label: 'Способи доставки',
              fields: [
                { name: 'title', type: 'text', required: true, label: 'Назва' },
                { name: 'note', type: 'text', label: 'Примітка' },
                {
                  name: 'icon',
                  type: 'select',
                  defaultValue: 'truck',
                  label: 'Іконка',
                  options: [
                    { label: 'Вантажівка', value: 'truck' },
                    { label: 'Локація', value: 'pin' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export const globals: GlobalConfig[] = [Home, Settings];
