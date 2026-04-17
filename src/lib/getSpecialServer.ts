export function getSpecialServer(): number {
  const reference = new Date("2025-04-17");
  const referenceServer = 5;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  reference.setHours(0, 0, 0, 0);

  const diffDays = Math.round(
    (today.getTime() - reference.getTime()) / (1000 * 60 * 60 * 24),
  );
  const server = ((((referenceServer - 1 + diffDays) % 6) + 6) % 6) + 1;

  return server;
}
