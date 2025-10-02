import { Button, Flex, Statistic } from 'antd';

interface GlobalUpdateButtonProps {
  totalTasks: number;
  loading: boolean;
  error: string | null;
  onUpdate: () => void;
}

/**
 * Componente del botón global para actualizar todas las tareas de vendors
 * Muestra estadísticas, estado de carga y errores
 */
function GlobalUpdateButton({ totalTasks, loading, error, onUpdate }: GlobalUpdateButtonProps) {
  return (
    <Flex
      justify="center"
      align="center"
      gap="large"
      style={{
        padding: '24px',
        backgroundColor: '#f0f2f5',
        borderRadius: '8px',
        marginBottom: '24px',
      }}
    >
      <Statistic title="Total Tasks" value={totalTasks} />
      <Button
        type="primary"
        size="large"
        onClick={onUpdate}
        loading={loading}
        disabled={totalTasks === 0}
        style={{ minWidth: '250px' }}
      >
        Update All Vendor Tasks
      </Button>
      {error && <p style={{ color: 'red', margin: 0 }}>{error}</p>}
    </Flex>
  );
}

export default GlobalUpdateButton;
