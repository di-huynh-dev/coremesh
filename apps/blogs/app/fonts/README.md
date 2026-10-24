# Blog fonts

The four `BeVietnamPro-*.woff2` files are the unmodified Regular (400),
Medium (500), SemiBold (600), and Bold (700) webfonts from
[Be Vietnam Pro](https://github.com/bettergui/BeVietnamPro/tree/804e62d81abbbcdcce5686069c69b41b8c245192/fonts/webfonts),
commit `804e62d81abbbcdcce5686069c69b41b8c245192`.
The accompanying license is in `OFL-BeVietnamPro.txt`.

`JetBrainsMono.woff2` is the unmodified variable webfont from
[JetBrains Mono](https://github.com/JetBrains/JetBrainsMono/blob/19371302b95d218af43299bce79ddbddd0bc364d/fonts/webfonts/JetBrainsMono%5Bwght%5D.woff2),
commit `19371302b95d218af43299bce79ddbddd0bc364d`.
It includes Latin and Vietnamese glyphs and is used at weights 400 and 500.
The accompanying license is in `OFL-JetBrainsMono.txt`.

Both families include Latin and Vietnamese glyphs and are bundled with
`next/font/local` because Google Fonts can return
extensionless font URLs with query parameters that fail to build with
Turbopack in Next.js 16.2.9. See
[vercel/next.js#99114](https://github.com/vercel/next.js/issues/99114).

JetBrains Mono SHA-256: `31ec365b93e4bad6f202ce23352a56d01ca4462b2afc782ed2cf6fa42ca9ac0e`
