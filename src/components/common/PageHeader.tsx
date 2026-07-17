import type { ReactNode } from 'react';
import { Breadcrumb } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export interface Crumb {
  label: string;
  to?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  crumbs?: Crumb[];
  actions?: ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  crumbs,
  actions,
}: PageHeaderProps) {
  return (
    <div className="mb-4">
      {crumbs && crumbs.length > 0 && (
        <Breadcrumb listProps={{ className: 'mb-1 small' }}>
          {crumbs.map((c, i) =>
            c.to && i < crumbs.length - 1 ? (
              <Breadcrumb.Item
                key={`${c.label}-${i}`}
                linkAs={Link}
                linkProps={{ to: c.to }}
              >
                {c.label}
              </Breadcrumb.Item>
            ) : (
              <Breadcrumb.Item key={`${c.label}-${i}`} active>
                {c.label}
              </Breadcrumb.Item>
            ),
          )}
        </Breadcrumb>
      )}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div>
          <h4 className="mb-0 fw-bold">{title}</h4>
          {subtitle && <div className="text-muted small">{subtitle}</div>}
        </div>
        {actions && <div className="d-flex gap-2">{actions}</div>}
      </div>
      <hr className="mt-3 mb-0" />
    </div>
  );
}
