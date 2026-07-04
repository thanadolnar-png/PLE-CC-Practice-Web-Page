import os

css_rules = '''
/* ÄÄ List View Modifiers ÄÄ */
.case-grid.list-view {
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

.case-grid.list-view .case-card,
.case-grid.list-view .skeleton-case-card {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem 1.5rem;
  min-height: auto;
}

.case-grid.list-view .case-card-header {
  flex: 0 0 120px;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
  margin-bottom: 0;
}

.case-grid.list-view .case-card-title {
  flex: 1;
  font-size: 1.05rem;
  margin: 0;
}

.case-grid.list-view .case-card-tag {
  display: none; /* Hide tags to save space */
}
.case-grid.list-view .case-card > div:nth-child(3) {
  display: none; /* Hide the tag container div */
}

.case-grid.list-view .case-card-meta {
  flex: 0 0 120px;
  margin-top: 0;
  border-top: none;
  padding-top: 0;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

/* Skeleton List View Modifiers */
.case-grid.list-view .skel-header {
  flex: 0 0 120px;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
}
.case-grid.list-view .skel-title {
  flex: 1;
  margin: 0;
}
.case-grid.list-view .skel-title-short,
.case-grid.list-view .skel-tag {
  display: none;
}
.case-grid.list-view .skel-meta {
  flex: 0 0 120px;
  margin-top: 0;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

/* Mobile responsive for list view */
@media (max-width: 600px) {
  .case-grid.list-view .case-card,
  .case-grid.list-view .skeleton-case-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1rem;
  }
  .case-grid.list-view .case-card-header,
  .case-grid.list-view .case-card-meta,
  .case-grid.list-view .skel-header,
  .case-grid.list-view .skel-meta {
    flex: auto;
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}
'''

with open('style.css', 'a', encoding='utf-8') as f:
    f.write(css_rules)
print('Appended CSS successfully.')
