let membershipCardData = null;

export function buildMembershipCardPayload(formValues) {
  if (!formValues) return {};
  const nameParts = [formValues.prenom, formValues.nom].filter(Boolean);
  const name = nameParts.length ? nameParts.join(" ") : "Union Mob";
  const unions = [formValues.union_principale, formValues.union_secondaire]
    .filter(Boolean)
    .join(" • ") || "Présence en exploration";
  const zones = [];
  if (formValues.niveau_engagement) zones.push(formValues.niveau_engagement);
  if (formValues.competences) zones.push(formValues.competences);
  const zonesText = zones.filter(Boolean).join(" • ") || "Zone d’expression à définir";
  const notes =
    formValues.motivation || formValues.construction || formValues.projet_existant || "—";
  const link = formValues.lien_unionmob || "Position à clarifier";
  membershipCardData = { name, unions, zones: zonesText, notes, link };
  return membershipCardData;
}

export function populateMembershipCard(nodes) {
  if (!membershipCardData || !nodes) return;
  const {
    membershipCard,
    membershipCardName,
    membershipCardUnions,
    membershipCardZones,
    membershipCardLink,
    membershipCardNotes
  } = nodes;

  if (membershipCardName) membershipCardName.textContent = membershipCardData.name;
  if (membershipCardUnions) membershipCardUnions.textContent = membershipCardData.unions;
  if (membershipCardZones) membershipCardZones.textContent = membershipCardData.zones;
  if (membershipCardLink) membershipCardLink.textContent = membershipCardData.link;
  if (membershipCardNotes) membershipCardNotes.textContent = membershipCardData.notes;

  if (membershipCard) {
    membershipCard.classList.remove("hidden");
    membershipCard.classList.add("visible");
  }
}

export function showMembershipCard(formValues, nodes) {
  buildMembershipCardPayload(formValues);
  populateMembershipCard(nodes);
}

export function hideMembershipCard({ membershipCard, successSection, successMessage, options = {} }) {
  if (membershipCard) {
    membershipCard.classList.remove("visible");
    membershipCard.classList.add("hidden");
  }

  if (options.showSuccess && successSection) {
    successSection.hidden = false;
    if (successMessage) {
      successMessage.textContent = options.message || "Ta présence est notée, rien d’autre.";
    }
  }
}
