import type { Field } from 'payload';

/**
 * Спільні поля. Винесені сюди, бо однакова «крихта» повторюється в 6 колекціях,
 * і без цього кожна нова колекція — це шанс забути валідацію слага.
 */

/** URL-слаг. Латиниця, цифри й дефіси — рівно те, що потрапляє в адресу сторінки. */
export const slugField = (description: string): Field => ({
  name: 'slug',
  type: 'text',
  required: true,
  unique: true,
  index: true,
  admin: { position: 'sidebar', description },
  validate: (value: string | null | undefined) => {
    if (typeof value !== 'string' || !value) return 'Слаг обовʼязковий';
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
      return 'Тільки маленькі латинські літери, цифри й дефіс: napryklad-otak';
    }
    return true;
  },
});

/**
 * Порядок сортування. Payload віддає документи в довільному порядку, а на сайті
 * картки мають стояти так, як їх поставив редактор, — тому поле явне, а не «як у базі».
 */
export const orderField: Field = {
  name: 'order',
  type: 'number',
  defaultValue: 0,
  admin: { position: 'sidebar', description: 'Менше число — вище в списку' },
};

/** Масив простих абзаців тексту (там, де rich text надлишковий). */
export const paragraphsField = (name: string, label: string, description?: string): Field => ({
  name,
  type: 'array',
  label,
  admin: { description, initCollapsed: true },
  fields: [{ name: 'text', type: 'textarea', required: true }],
});

/** Масив коротких рядків — пункти списків, переваги тощо. */
export const bulletsField = (name: string, label: string, description?: string): Field => ({
  name,
  type: 'array',
  label,
  admin: { description, initCollapsed: true },
  fields: [{ name: 'text', type: 'text', required: true }],
});
