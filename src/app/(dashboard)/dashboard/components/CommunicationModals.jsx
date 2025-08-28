"use client"
import SendEmailCon from "@/app/(dashboard)/(DataComponents)/SendEmailCon/page";
import WhatsAppCon from "@/app/(dashboard)/(DataComponents)/SendWhatsappCon/page";
import CallCon from "@/app/(dashboard)/(DataComponents)/SendCallCon/page";
import SendSmsCon from "@/app/(dashboard)/(DataComponents)/SendSmsCon/page";
import ReportCon from "@/app/(dashboard)/(DataComponents)/ReportCon/page";

const CommunicationModals = ({
  showEmailSend,
  setShowEmailSend,
  showWhatsappSend,
  setShowSendWhatsapp,
  showCallSend,
  setShowCallSend,
  showSmsSend,
  setShowSmsSend,
  showReportCon,
  setShowReportCon,
  selectedRows,
  setSelectedRows,
  userID,
  fetchData,
  userData,
}) => {
  return (
    <>
      {/* Email Send Modal */}
      {showEmailSend && (
        <SendEmailCon
          setSendEmail={setShowEmailSend}
          setSelectedLeads={setSelectedRows}
          selectedLeads={selectedRows}
          userID={userID}
        />
      )}

      {/* WhatsApp Send Modal */}
      {showWhatsappSend && (
        <WhatsAppCon
          setClose={setShowSendWhatsapp}
          setSelectedLeads={setSelectedRows}
          selectedLeads={selectedRows}
          userID={userID}
        />
      )}

      {/* Call Send Modal */}
      {showCallSend && (
        <CallCon
          setShowCallCon={setShowCallSend}
          setSelectedLeads={setSelectedRows}
          selectedLeads={selectedRows}
          fetchData={() => fetchData(userID)}
        />
      )}

      {/* SMS Send Modal */}
      {showSmsSend && (
        <SendSmsCon
          setClose={setShowSmsSend}
          setSelectedLeads={setSelectedRows}
          selectedLeads={selectedRows}
          userID={userID}
        />
      )}

      {/* Report Modal */}
      {showReportCon && (
        <ReportCon setShow={setShowReportCon} userData={userData} />
      )}
    </>
  );
};

export default CommunicationModals;
