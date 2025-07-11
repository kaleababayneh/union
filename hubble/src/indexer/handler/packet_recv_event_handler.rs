use tracing::trace;

use crate::indexer::{
    api::IndexerError,
    event::packet_recv_event::PacketRecvEvent,
    handler::EventContext,
    record::{change_counter::Changes, packet_recv_record::PacketRecvRecord, ChainContext},
};
impl<'a> EventContext<'a, ChainContext, PacketRecvEvent> {
    pub async fn handle(
        &self,
        tx: &mut sqlx::Transaction<'_, sqlx::Postgres>,
    ) -> Result<Changes, IndexerError> {
        trace!("handle({self:?})");

        PacketRecvRecord::try_from(self)?.insert(tx).await
    }
}
