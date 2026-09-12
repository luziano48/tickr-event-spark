import { useMemo, useState } from "react";

export const eventFormCategories = ["MÚSICA", "CULTURA", "FESTIVAL", "NEGÓCIOS", "DESPORTO"];

export const ageOptions = ["Livre", "+12", "+16", "+18"];

export const createSteps = [
  { id: "info", label: "Informações" },
  { id: "local", label: "Data/Local" },
  { id: "ingressos", label: "Ingressos" },
  { id: "detalhes", label: "Detalhes" },
  { id: "revisar", label: "Revisar" },
];

const emptyTicket = () => ({
  id: `t-${Math.random().toString(36).slice(2, 9)}`,
  name: "",
  price: "",
  quantity: "",
});

const initialForm = {
  title: "",
  imageUrl: "",
  imageName: "",
  category: "",
  description: "",
  date: "",
  time: "",
  city: "",
  venue: "",
  address: "",
  tickets: [emptyTicket()],
  age: "Livre",
  rules: "",
  contactName: "",
  whatsapp: "",
};

function validateStep(stepId, form) {
  const errors = {};
  if (stepId === "info") {
    if (!form.title.trim()) errors.title = "Escreva o nome do evento.";
    else if (form.title.trim().length > 80) errors.title = "Máximo de 80 caracteres.";
    if (!form.category) errors.category = "Escolha uma categoria.";
    if (!form.description.trim()) errors.description = "Escreva uma breve descrição.";
    else if (form.description.trim().length > 600) errors.description = "Máximo de 600 caracteres.";
  }
  if (stepId === "local") {
    if (!form.date) errors.date = "Escolha a data.";
    if (!form.time) errors.time = "Escolha o horário.";
    if (!form.city.trim()) errors.city = "Indique a cidade.";
    if (!form.venue.trim()) errors.venue = "Indique o local.";
  }
  if (stepId === "ingressos") {
    if (form.tickets.length === 0) errors.tickets = "Crie pelo menos um tipo de ingresso.";
    form.tickets.forEach((ticket, index) => {
      if (!ticket.name.trim()) errors[`ticket-${index}-name`] = "Nome obrigatório.";
      if (ticket.price === "" || Number(ticket.price) < 0)
        errors[`ticket-${index}-price`] = "Preço inválido.";
      if (ticket.quantity === "" || Number(ticket.quantity) <= 0)
        errors[`ticket-${index}-quantity`] = "Quantidade inválida.";
    });
  }
  if (stepId === "detalhes") {
    const digits = form.whatsapp.replace(/\D/g, "");
    if (!form.contactName.trim()) errors.contactName = "Indique um responsável.";
    if (!digits) errors.whatsapp = "Indique o WhatsApp de contacto.";
    else if (digits.length < 9) errors.whatsapp = "Número demasiado curto.";
  }
  return errors;
}

export function useCreateEvent() {
  const [form, setForm] = useState(initialForm);
  const [stepIndex, setStepIndex] = useState(0);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");

  const step = createSteps[stepIndex];

  const setField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const selectImage = (file) => {
    if (!file) return;
    setForm((current) => ({
      ...current,
      imageUrl: URL.createObjectURL(file),
      imageName: file.name,
    }));
  };

  const addTicket = () =>
    setForm((current) => ({ ...current, tickets: [...current.tickets, emptyTicket()] }));

  const updateTicket = (id, name, value) =>
    setForm((current) => ({
      ...current,
      tickets: current.tickets.map((ticket) =>
        ticket.id === id ? { ...ticket, [name]: value } : ticket,
      ),
    }));

  const removeTicket = (id) =>
    setForm((current) => ({
      ...current,
      tickets: current.tickets.filter((ticket) => ticket.id !== id),
    }));

  const goNext = () => {
    const stepErrors = validateStep(step.id, form);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) return;
    setStepIndex((index) => Math.min(index + 1, createSteps.length - 1));
  };

  const goBack = () => {
    setErrors({});
    setStepIndex((index) => Math.max(index - 1, 0));
  };

  const goToStep = (index) => {
    setErrors({});
    setStepIndex(index);
  };

  const submit = async () => {
    if (status === "sending") return;
    const allErrors = createSteps.reduce(
      (acc, current) => ({ ...acc, ...validateStep(current.id, form) }),
      {},
    );
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      setStepIndex(0);
      return;
    }
    setStatus("sending");
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setStatus("done");
  };

  const reset = () => {
    setForm({ ...initialForm, tickets: [emptyTicket()] });
    setErrors({});
    setStepIndex(0);
    setStatus("idle");
  };

  const totalCapacity = useMemo(
    () => form.tickets.reduce((total, ticket) => total + (Number(ticket.quantity) || 0), 0),
    [form.tickets],
  );

  return {
    form,
    setField,
    selectImage,
    addTicket,
    updateTicket,
    removeTicket,
    errors,
    status,
    step,
    stepIndex,
    steps: createSteps,
    goNext,
    goBack,
    goToStep,
    submit,
    reset,
    totalCapacity,
  };
}
