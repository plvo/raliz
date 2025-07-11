'use client';

import { formatDate, formatDateTime } from '@repo/ui/lib/utils';
import { useEffect, useState } from 'react';

type FormattedDateProps = {
  date: string | Date | null | undefined;
  showTime?: boolean;
  className?: string;
};

/**
 * Composant client isolé pour afficher les dates formatées
 * Cela évite les problèmes d'hydratation en isolant la logique de formatage côté client
 */
export function FormattedDate({ date, showTime = false, className = '' }: FormattedDateProps) {
  const [formattedValue, setFormattedValue] = useState<string>('');

  useEffect(() => {
    // Formatage uniquement côté client pour éviter les problèmes d'hydratation
    if (showTime) {
      setFormattedValue(formatDateTime(date));
    } else {
      setFormattedValue(formatDate(date));
    }
  }, [date, showTime]);

  // Retourne un placeholder initial pour le serveur, qui sera remplacé côté client
  return <span className={className}>{formattedValue}</span>;
}

/**
 * Composant pour afficher une période (date de début - date de fin)
 */
export function FormattedDateRange({
  startDate,
  endDate,
  className = '',
}: {
  startDate: string | Date | null | undefined;
  endDate: string | Date | null | undefined;
  className?: string;
}) {
  const [formattedRange, setFormattedRange] = useState<string>('');

  useEffect(() => {
    // Formatage uniquement côté client
    const formattedStart = formatDate(startDate);
    const formattedEnd = formatDate(endDate);
    setFormattedRange(`${formattedStart} - ${formattedEnd}`);
  }, [startDate, endDate]);

  return <span className={className}>{formattedRange}</span>;
}
