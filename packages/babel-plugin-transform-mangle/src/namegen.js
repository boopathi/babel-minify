export default function nameGenerator() {
  const atoz = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let i = 0;
  while (true) {
    if (i) for (let j of atoz) yield j+i;
    else yield* atoz;
    i++;
  }
}
