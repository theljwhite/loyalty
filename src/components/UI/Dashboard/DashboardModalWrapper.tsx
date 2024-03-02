interface ModalWrapperProps {
  children: React.ReactNode;
  setIsModalOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  setIsOpenFunc?: (isOpen: boolean) => void;
}

export default function DashboardModalWrapper({
  children,
  setIsModalOpen,
  setIsOpenFunc,
}: ModalWrapperProps) {
  const closeModalOnOverlayClick = (
    e: React.MouseEvent<HTMLDivElement>,
  ): void => {
    if (e.target === e.currentTarget) {
      setIsModalOpen && setIsModalOpen(false);
      setIsOpenFunc && setIsOpenFunc(false);
    }
  };

  return (
    <>
      <div className="fixed left-0 top-0 !m-0 h-dvh w-screen bg-black/[0.32]" />
      <div
        onClick={closeModalOnOverlayClick}
        className="fixed left-0 top-0 z-[1400] flex h-dvh w-screen items-start justify-center overflow-auto overscroll-y-none"
      >
        <section className="relative z-[1400] my-16 flex w-full max-w-lg flex-col rounded-2xl bg-white py-8 outline-none [box-shadow:0_10px_15px_-3px_rgba(0,_0,_0,_0.1),0_4px_6px_-2px_rgba(0,_0,_0,_0.05)]">
          {children}
        </section>
      </div>
    </>
  );
}
