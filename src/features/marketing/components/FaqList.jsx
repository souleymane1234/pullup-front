/** @param {{ items: import('../content/faq.js').FaqEntry[] }} props */
export function FaqList({ items }) {
  return items.map(([question, answer]) => (
    <details key={question} className="faq">
      <summary>{question}</summary>
      <p>{answer}</p>
    </details>
  ));
}
