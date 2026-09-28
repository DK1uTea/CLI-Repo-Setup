'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ComboboxFloat } from '@/shared/components/ui/combobox-float';
import { useListCamUsers, CamUser } from '../../(hooks)/use-list-cam-users';
import { ParticipantDetail } from '../../(hooks)/use-get-activation-participants';

type Props = {
  participants: ParticipantDetail[];
  selectedUsers: CamUser[];
  onAdd: (user: CamUser) => void;
};

const ParticipantSearchCombobox = ({ participants, selectedUsers, onAdd }: Props) => {
  const t = useTranslations('activationView.participants');
  const [value, setValue] = useState('');
  const [search, setSearch] = useState('');
  const { users, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useListCamUsers(search);

  const existingIds = new Set([
    ...participants.map((p) => p.user.id),
    ...selectedUsers.map((u) => u.id),
  ]);
  const availableUsers = users.filter((u) => !existingIds.has(u.id));
  const options = availableUsers.map((u) => ({ value: u.id, label: `${u.name} · ${u.email}` }));

  const handleValueChange = (id: string) => {
    const user = availableUsers.find((u) => u.id === id);
    setValue('');
    if (user) onAdd(user);
  };

  return (
    <div className="flex flex-col gap-1">
      <ComboboxFloat
        label={t('searchLabel')}
        value={value}
        onValueChange={handleValueChange}
        onSearchChange={setSearch}
        options={options}
        onLoadMore={fetchNextPage}
        hasMore={hasNextPage}
        loadingMore={isFetchingNextPage}
      />
      {!isLoading && options.length === 0 && (
        <p className="px-1 text-xs text-muted-foreground">{t('noUsersFound')}</p>
      )}
    </div>
  );
};

export default ParticipantSearchCombobox;
