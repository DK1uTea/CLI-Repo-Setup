import { TableCell, TableRow } from "@/shared/components/ui/table";
import type { EventLocation } from "../(hooks)/use-event-location-pagination";
import EventAddressDeleteDialog from "./event-address-delete-dialog";
import EventAddressEditDialog from "./event-address-edit-dialog";

type EventAddressRowProps = {
  address: EventLocation;
  onDelete?: () => void;
};

const EventAddressRow = ({ address, onDelete }: EventAddressRowProps) => {
  return (
    <TableRow className="h-14">
      <TableCell className="px-5 font-bold">{address.name}</TableCell>
      <TableCell className="px-5 text-muted-foreground">{address.street}</TableCell>
      <TableCell className="px-5">{address.postalCode}</TableCell>
      <TableCell className="px-5">{address.city}</TableCell>
      <TableCell className="w-0 whitespace-nowrap px-5">
        <div className="flex justify-end gap-1.5">
          <EventAddressEditDialog address={address} />
          <EventAddressDeleteDialog addressName={address.name} onConfirm={onDelete} />
        </div>
      </TableCell>
    </TableRow>
  );
}

export default EventAddressRow;
