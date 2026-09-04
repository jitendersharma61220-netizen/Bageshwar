import { Section } from '@/components/ui/Section';

/**
 * The answer band.
 *
 * Four short columns answering the questions a first-time visitor asks before
 * anything else. Plain crawlable text, placed immediately below the hero,
 * because this is the block an answer engine is most likely to lift when asked
 * what this company does.
 */
const answers = [
  {
    question: 'What we do',
    answer:
      'We execute road safety and marking works: thermoplastic road markings, highway and expressway markings, runway and taxiway markings, road studs, traffic signboards and highway safety assets.',
  },
  {
    question: 'Who we work with',
    answer:
      'EPC contractors, highway contractors, road developers, concessionaires and toll operators, airport and aviation infrastructure teams, and industrial, logistics and urban infrastructure developers.',
  },
  {
    question: 'Where we operate',
    answer:
      'We mobilise for projects across India, moving machinery, material and crew to site and sustaining them there for the duration of the works.',
  },
  {
    question: 'How to engage us',
    answer:
      'Send the stretch, facility or BOQ through a project enquiry, a quote request or a tender submission. We respond with the scope questions that determine the rate and the programme.',
  },
];

export function AnswerBand() {
  return (
    <Section tone="dark" width="wide" labelledBy="answers-heading">
      <h2 id="answers-heading" className="sr-only">
        What Bageshwar Balaji Construction Co. does
      </h2>
      <dl className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {answers.map((item) => (
          <div key={item.question} className="border-t border-graphite-700 pt-5">
            <dt className="text-sm font-semibold text-safety-400">{item.question}</dt>
            <dd className="mt-2.5 text-sm leading-relaxed text-graphite-300">
              {item.answer}
            </dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
