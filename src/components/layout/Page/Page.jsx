/** @param {{ title: string, children: import('react').ReactNode, intro?: string }} props */
export function Page({ title, intro, children }) {
  return (
    <div className="wrap section tight">
      <h1>{title}</h1>
      {intro ? <p className="muted">{intro}</p> : null}
      {children}
    </div>
  );
}
