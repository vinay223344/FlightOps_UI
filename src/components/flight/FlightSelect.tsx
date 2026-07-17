import { Form } from 'react-bootstrap';
import type { FlightResponse } from '../../types';

interface FlightSelectProps {
  flights: FlightResponse[];
  value: string;
  onChange: (flightId: string) => void;
  id?: string;
  disabled?: boolean;
  placeholder?: string;
  isInvalid?: boolean;
}

/** A <select> of flights showing "AI101 · BLR→DEL". */
export default function FlightSelect({
  flights,
  value,
  onChange,
  id = 'flightId',
  disabled,
  placeholder = 'Select a flight…',
  isInvalid,
}: FlightSelectProps) {
  return (
    <Form.Select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      isInvalid={isInvalid}
    >
      <option value="">{placeholder}</option>
      {flights.map((f) => (
        <option key={f.flightId} value={f.flightId}>
          {f.airlineCode}
          {f.flightNumber} · {f.origin}→{f.destination}
        </option>
      ))}
    </Form.Select>
  );
}
