import type { Story, StoryDefault } from '@ladle/react';
import { useState } from 'react';
import { Pagination, type PaginationProps } from './Pagination';

export default { title: 'Sakuga / Navigation / Pagination' } satisfies StoryDefault;

export const Counted: Story = () => {
  const [page, setPage] = useState(1);
  return <Pagination page={page} pages={2} total={31} pageSize={24} noun="shorts" label="Pages of shorts" onChange={setPage} />;
};

export const Folded: Story = () => {
  const [page, setPage] = useState(5);
  return <Pagination page={page} pages={12} total={281} pageSize={24} noun="pictures" label="Pages of pictures" onChange={setPage} />;
};

export const PageOf: Story = () => {
  const [page, setPage] = useState(3);
  return <Pagination page={page} pages={4} onChange={setPage} />;
};

export const LastPage: Story = () => <Pagination page={12} pages={12} total={281} noun="pictures" onChange={() => undefined} />;

export const Links: Story = () => <Pagination page={2} pages={3} hrefs={['#1', '#2', '#3']} total={60} noun="shorts" />;

export const Playground: Story<PaginationProps> = (args) => <Pagination {...args} />;
Playground.args = { page: 5, pages: 12, total: 281, pageSize: 24, noun: 'pictures', label: 'Pages' };
