import { Alert, Intent } from '@blueprintjs/core';

type AlertConfirmProps = {
  game: string;
  isOpen: boolean;
  isLoading: boolean;
  handleCloseDialog: () => void;
  handleDeleteGame: () => void;
};

export const DeleteGameAlert = ({
  game,
  isOpen,
  isLoading,
  handleCloseDialog,
  handleDeleteGame,
}: AlertConfirmProps) => {
  return (
    <Alert
      canEscapeKeyCancel={false}
      canOutsideClickCancel={false}
      cancelButtonText="Cancel"
      confirmButtonText="Confirm to Delete"
      icon="trash"
      intent={Intent.DANGER}
      isOpen={isOpen}
      loading={isLoading}
      onCancel={handleCloseDialog}
      onConfirm={handleDeleteGame}
    >
      <p>
        Are you SURE to delete game folder <br />
        <b>{game}</b>? <br />
        This will remove folder and files underneath your game workspace!
      </p>
    </Alert>
  );
};
