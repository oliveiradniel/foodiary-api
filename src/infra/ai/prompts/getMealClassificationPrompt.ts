import dedent from 'ts-dedent';

export function getMealClassificationPrompt() {
	return dedent`
  Assign a meal name and an appropriate emoji based only on the provided meal local time, using exactly one of the following categories:

  - 05:00 to 09:59 — "Café da Manhã" — ☕
  - 10:00 to 11:29 — "Lanche" — 🍎
  - 11:30 to 14:59 — "Almoço" — 🍛
  - 15:00 to 18:29 — "Lanche da Tarde" — 🥪
  - 18:30 to 21:59 — "Jantar" — 🍽️
  - 22:00 to 04:59 — "Ceia" — 🌙

  If the local time is unavailable, use "Refeição" with the 🍽️ emoji.

  Never invent a meal time or infer it from the meal content.
`;
}
