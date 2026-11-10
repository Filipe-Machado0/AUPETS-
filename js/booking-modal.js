/**
 * Aupets Banho & Tosa - Interactive Booking Modal Logic
 * Lucas do Rio Verde - MT
 * WhatsApp: (65) 9910-2445
 */

(function () {
  const WHATSAPP_NUMBER = '556599102445'; // WhatsApp oficial da Aupets

  // Estado do agendamento em andamento
  const bookingState = {
    service: 'Pacote Premium (4 Banhos + Cuidados Especiais) - R$ 185',
    petSize: 'Pequeno (até 10kg)',
    date: '',
    time: '',
    petName: '',
    petBreed: '',
    clientName: '',
    clientPhone: '',
    notes: '',
    currentStep: 1
  };

  // Cria estrutura do modal no DOM se não existir
  function injectModalHTML() {
    if (document.getElementById('bookingModalBackdrop')) return;

    // Data mínima: hoje; Data padrão: amanhã se for depois das 17h
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    
    let defaultDate = new Date();
    if (now.getHours() >= 17) {
      defaultDate.setDate(defaultDate.getDate() + 1);
    }
    // Pular domingo (domingo = 0)
    if (defaultDate.getDay() === 0) {
      defaultDate.setDate(defaultDate.getDate() + 1);
    }
    bookingState.date = toISO(defaultDate);

    const modalHTML = `
      <div class="booking-modal-backdrop" id="bookingModalBackdrop">
        <div class="booking-modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
          <!-- Header -->
          <div class="booking-modal__header">
            <div class="booking-modal__header-info">
              <div class="booking-modal__logo-badge">
                <img src="assets/images/logo.png" alt="Aupets">
              </div>
              <div>
                <h3 class="booking-modal__title" id="modalTitle">Agendamento Online</h3>
                <p class="booking-modal__subtitle">Aupets Banho &amp; Tosa &bull; Lucas do Rio Verde - MT</p>
              </div>
            </div>
            <button class="booking-modal__close" id="modalCloseBtn" aria-label="Fechar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <!-- Steps Progress Bar -->
          <div class="booking-steps-bar" id="bookingStepsBar">
            <div class="booking-step-dot is-active" data-step="1">
              <span class="booking-step-dot__num">1</span>
              <span>Serviço &amp; Pet</span>
            </div>
            <div class="booking-step-dot" data-step="2">
              <span class="booking-step-dot__num">2</span>
              <span>Data &amp; Horário</span>
            </div>
            <div class="booking-step-dot" data-step="3">
              <span class="booking-step-dot__num">3</span>
              <span>Seus Dados</span>
            </div>
            <div class="booking-step-dot" data-step="4">
              <span class="booking-step-dot__num">4</span>
              <span>Confirmação</span>
            </div>
          </div>

          <!-- Body -->
          <div class="booking-modal__body">
            <!-- STEP 1: Serviço e Porte -->
            <div class="booking-step-panel is-active" id="stepPanel1">
              <h4 class="step-instruction">Qual cuidado o seu amigo precisa?</h4>
              <p class="step-hint">Selecione o pacote ou serviço avulso desejado:</p>

              <!-- Promo Banner Inside Modal -->
              <div class="modal-promo-chip">
                <span class="promo-chip-tag">50% OFF</span>
                <span>Super promoção: 50% de desconto em qualquer tosa este mês!</span>
              </div>

              <div class="booking-options-grid" id="serviceOptions">
                <!-- Pacote Premium -->
                <label class="option-card-radio option-card-radio--featured">
                  <input type="radio" name="bookingService" value="Pacote Premium (4 Banhos + Cuidados Especiais) - R$ 185" checked>
                  <div class="option-card-radio__content">
                    <div class="option-card-radio__badge">Mais Escolhido</div>
                    <div class="option-title">Pacote Premium Mensal</div>
                    <div class="option-desc">4 Banhos + 1 Tosa Higiênica + Hidratação + Unhas + Ouvidos + Patinhas + Escovação Bucal</div>
                    <div class="option-price">R$ 185,00 <span>/ mês</span></div>
                  </div>
                </label>

                <!-- Pacote Simples -->
                <label class="option-card-radio">
                  <input type="radio" name="bookingService" value="Pacote Simples (4 Banhos + Tosa Higiênica + Hidratação) - R$ 170">
                  <div class="option-card-radio__content">
                    <div class="option-title">Pacote Simples Mensal</div>
                    <div class="option-desc">4 Banhos revigorantes + 1 Tosa Higiênica + Hidratação profunda + Corte de unhas e ouvidos</div>
                    <div class="option-price">R$ 170,00 <span>/ mês</span></div>
                  </div>
                </label>

                <!-- Tosa Completa Promoção -->
                <label class="option-card-radio option-card-radio--promo">
                  <input type="radio" name="bookingService" value="Tosa Completa (50% OFF no Mês)">
                  <div class="option-card-radio__content">
                    <div class="option-card-radio__badge option-card-radio__badge--promo">50% OFF</div>
                    <div class="option-title">Tosa Completa (Máquina ou Tesoura)</div>
                    <div class="option-desc">Banho completo + Tosa geral da raça ou padrão do tutor + hidratação</div>
                    <div class="option-price"><s style="color:#999;font-size:0.85em;margin-right:6px">R$ 120</s> R$ 60,00 <span>promocional</span></div>
                  </div>
                </label>

                <!-- Banho Revigorante Avulso -->
                <label class="option-card-radio">
                  <input type="radio" name="bookingService" value="Banho Revigorante Avulso">
                  <div class="option-card-radio__content">
                    <div class="option-title">Banho Revigorante Avulso</div>
                    <div class="option-desc">Shampoo hipoalergênico, massagem, secagem cuidadosa, unhas e limpeza de ouvidos</div>
                    <div class="option-price">A partir de R$ 55,00</div>
                  </div>
                </label>

                <!-- Banho + Tosa Higiênica -->
                <label class="option-card-radio">
                  <input type="radio" name="bookingService" value="Banho + Tosa Higiênica">
                  <div class="option-card-radio__content">
                    <div class="option-title">Banho + Tosa Higiênica</div>
                    <div class="option-desc">Banho completo com higienização de patinhas, barriga e região íntima</div>
                    <div class="option-price">A partir de R$ 75,00</div>
                  </div>
                </label>

                <!-- Spa Patinhas e Bucal -->
                <label class="option-card-radio">
                  <input type="radio" name="bookingService" value="Hidratação de Patinhas & Escovação Bucal">
                  <div class="option-card-radio__content">
                    <div class="option-title">Spa Patinhas &amp; Escovação Bucal</div>
                    <div class="option-desc">Hidratação profunda dos coxins e higiene oral preventiva contra tártaro</div>
                    <div class="option-price">R$ 25,00</div>
                  </div>
                </label>
              </div>

              <h4 class="step-instruction" style="margin-top: 24px;">Qual o porte do seu pet?</h4>
              <div class="pet-size-selector">
                <label class="size-pill">
                  <input type="radio" name="petSize" value="Pequeno (até 10kg)" checked>
                  <span>Pequeno (&le;10kg)</span>
                </label>
                <label class="size-pill">
                  <input type="radio" name="petSize" value="Médio (10 a 20kg)">
                  <span>Médio (10-20kg)</span>
                </label>
                <label class="size-pill">
                  <input type="radio" name="petSize" value="Grande (+20kg)">
                  <span>Grande (+20kg)</span>
                </label>
                <label class="size-pill">
                  <input type="radio" name="petSize" value="Gato / Felino">
                  <span>Gato / Felino</span>
                </label>
              </div>
            </div>

            <!-- STEP 2: Data & Horário -->
            <div class="booking-step-panel" id="stepPanel2">
              <h4 class="step-instruction">Para quando você gostaria de agendar?</h4>
              <p class="step-hint">Atendimento de Seg a Qui (07:30-11:30 e 13:30-18:00) | Sex e Sáb (07:30-11:30):</p>

              <div class="booking-date-picker-wrap">
                <label for="bookingDateInput" class="input-label">Data do Atendimento:</label>
                <input type="date" id="bookingDateInput" class="booking-date-input">
              </div>

              <div class="slots-section-title">
                <span>Horários Disponíveis em Lucas do Rio Verde:</span>
                <span class="slots-live-tag">
                  <span class="live-dot"></span> Tempo Real
                </span>
              </div>

              <!-- Container de Horários -->
              <div class="slots-grid-container" id="slotsGridContainer">
                <!-- Injetado dinamicamente -->
              </div>
            </div>

            <!-- STEP 3: Dados do Tutor & Pet -->
            <div class="booking-step-panel" id="stepPanel3">
              <h4 class="step-instruction">Quem é o seu amigo de quatro patas?</h4>
              <p class="step-hint">Preencha os dados para a equipe da Aupets preparar tudo com muito carinho:</p>

              <div class="form-row form-row--two-col">
                <div>
                  <label for="inputPetName">Nome do Pet *</label>
                  <input type="text" id="inputPetName" placeholder="Ex: Mel, Thor, Nina, Pipoca..." required>
                </div>
                <div>
                  <label for="inputPetBreed">Raça do Pet</label>
                  <input type="text" id="inputPetBreed" placeholder="Ex: Shih-tzu, Poodle, SRD, Gatinho...">
                </div>
              </div>

              <div class="form-row form-row--two-col">
                <div>
                  <label for="inputClientName">Seu Nome (Tutor) *</label>
                  <input type="text" id="inputClientName" placeholder="Nome completo" required>
                </div>
                <div>
                  <label for="inputClientPhone">Seu WhatsApp *</label>
                  <input type="tel" id="inputClientPhone" placeholder="(65) 99999-9999" required>
                </div>
              </div>

              <div class="form-row">
                <label for="inputNotes">Observações Especiais (Opcional)</label>
                <textarea id="inputNotes" rows="2" placeholder="Ex: tem medo de secador, velhinho, alérgico, muito carinhoso..."></textarea>
              </div>
            </div>

            <!-- STEP 4: Confirmação & Sucesso -->
            <div class="booking-step-panel" id="stepPanel4">
              <div class="booking-success-box">
                <div class="booking-success-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h3 class="booking-success-title">Horário Reservado com Sucesso!</h3>
                <p class="booking-success-text">
                  Seu horário já foi salvo na agenda da <strong>Aupets Banho &amp; Tosa</strong>. Para finalizar e garantir o atendimento com nossa equipe, envie a confirmação no WhatsApp com 1 clique:
                </p>

                <div class="booking-ticket" id="bookingTicketSummary">
                  <!-- Gerado dinamicamente -->
                </div>

                <a href="#" id="btnWhatsAppConfirmSend" target="_blank" rel="noopener noreferrer" class="btn-whatsapp-confirm">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                  <span>Enviar Confirmação no WhatsApp da Aupets</span>
                </a>
              </div>
            </div>
          </div>

          <!-- Footer Buttons -->
          <div class="booking-modal__footer" id="modalFooterNav">
            <button type="button" class="btn-modal-prev" id="btnStepPrev" style="display: none;">Voltar</button>
            <button type="button" class="btn-modal-next" id="btnStepNext">
              <span>Continuar</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    setupModalEvents();
  }

  // Renderiza slots de horários com base na data escolhida
  function renderSlots() {
    const container = document.getElementById('slotsGridContainer');
    if (!container) return;
    container.innerHTML = '';

    const dateStr = bookingState.date;
    if (!dateStr) {
      container.innerHTML = '<p class="slots-empty-notice">Por favor, selecione uma data acima.</p>';
      return;
    }

    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dayOfWeek = dateObj.getDay();

    if (dayOfWeek === 0) {
      container.innerHTML = `
        <div class="slots-closed-banner">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <div>
            <strong>Fechado aos Domingos</strong>
            <p>A equipe Aupets descansa aos domingos para cuidar ainda melhor do seu pet durante a semana! Escolha outro dia no calendário.</p>
          </div>
        </div>
      `;
      bookingState.time = '';
      updateNavButtons();
      return;
    }

    const slots = BookingStore.getAvailableSlots(dateStr);

    if (!slots || slots.length === 0) {
      container.innerHTML = '<p class="slots-empty-notice">Nenhum horário disponível para esta data. Tente outro dia.</p>';
      bookingState.time = '';
      updateNavButtons();
      return;
    }

    // Separa manhã e tarde
    const morningSlots = slots.filter(s => parseInt(s.time.split(':')[0], 10) < 13);
    const afternoonSlots = slots.filter(s => parseInt(s.time.split(':')[0], 10) >= 13);

    let html = '';

    if (morningSlots.length > 0) {
      html += `
        <div class="slots-period-group">
          <div class="slots-period-header">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>
            <span>Manhã (07:30 às 11:30)</span>
          </div>
          <div class="slots-grid">
            ${morningSlots.map(slot => `
              <button type="button" class="slot-pill ${slot.isAvailable ? '' : 'is-unavailable'} ${bookingState.time === slot.time ? 'is-selected' : ''}" 
                data-time="${slot.time}" ${slot.isAvailable ? '' : 'disabled'}>
                ${slot.time}
              </button>
            `).join('')}
          </div>
        </div>
      `;
    }

    if (afternoonSlots.length > 0) {
      html += `
        <div class="slots-period-group">
          <div class="slots-period-header">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            <span>Tarde (13:30 às 18:00)</span>
          </div>
          <div class="slots-grid">
            ${afternoonSlots.map(slot => `
              <button type="button" class="slot-pill ${slot.isAvailable ? '' : 'is-unavailable'} ${bookingState.time === slot.time ? 'is-selected' : ''}" 
                data-time="${slot.time}" ${slot.isAvailable ? '' : 'disabled'}>
                ${slot.time}
              </button>
            `).join('')}
          </div>
        </div>
      `;
    } else if (dayOfWeek === 5 || dayOfWeek === 6) {
      html += `
        <div class="slots-info-badge">
          <span>ℹ️ Às sextas e sábados, o atendimento é realizado no período da manhã (07:30 às 11:30).</span>
        </div>
      `;
    }

    container.innerHTML = html;

    // Eventos de clique nos horários
    container.querySelectorAll('.slot-pill:not(.is-unavailable)').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.slot-pill').forEach(b => b.classList.remove('is-selected'));
        btn.classList.add('is-selected');
        bookingState.time = btn.getAttribute('data-time');
        updateNavButtons();
      });
    });

    // Se o horário selecionado anteriormente ficou indisponível, reseta
    const currentStillAvailable = slots.find(s => s.time === bookingState.time && s.isAvailable);
    if (!currentStillAvailable) {
      bookingState.time = '';
    }
    updateNavButtons();
  }

  // Atualiza botões do rodapé e indicadores de etapas
  function updateNavButtons() {
    const btnPrev = document.getElementById('btnStepPrev');
    const btnNext = document.getElementById('btnStepNext');
    const footer = document.getElementById('modalFooterNav');

    if (bookingState.currentStep === 4) {
      footer.style.display = 'none'; // Na tela de sucesso, só o botão do WhatsApp importa
      return;
    } else {
      footer.style.display = 'flex';
    }

    // Botão Voltar
    if (bookingState.currentStep === 1) {
      btnPrev.style.display = 'none';
    } else {
      btnPrev.style.display = 'inline-block';
    }

    // Botão Avançar / Finalizar
    if (bookingState.currentStep === 1) {
      btnNext.disabled = false;
      btnNext.querySelector('span').textContent = 'Escolher Horário';
    } else if (bookingState.currentStep === 2) {
      btnNext.disabled = !bookingState.time;
      btnNext.querySelector('span').textContent = bookingState.time ? `Confirmar ${bookingState.time}` : 'Selecione um Horário';
    } else if (bookingState.currentStep === 3) {
      const petName = document.getElementById('inputPetName').value.trim();
      const clientName = document.getElementById('inputClientName').value.trim();
      const clientPhone = document.getElementById('inputClientPhone').value.trim();
      const valid = petName && clientName && clientPhone;
      btnNext.disabled = !valid;
      btnNext.querySelector('span').textContent = 'Finalizar Agendamento';
    }

    // Atualiza barras de progresso
    document.querySelectorAll('.booking-step-dot').forEach(dot => {
      const stepNum = parseInt(dot.getAttribute('data-step'), 10);
      dot.classList.remove('is-active', 'is-done');
      if (stepNum === bookingState.currentStep) {
        dot.classList.add('is-active');
      } else if (stepNum < bookingState.currentStep) {
        dot.classList.add('is-done');
      }
    });
  }

  function resetModalScroll() {
    const backdrop = document.getElementById('bookingModalBackdrop');
    if (!backdrop) return;
    const modalCard = backdrop.querySelector('.booking-modal');
    const modalBody = backdrop.querySelector('.booking-modal__body');

    backdrop.scrollTop = 0;
    if (modalCard) modalCard.scrollTop = 0;
    if (modalBody) modalBody.scrollTop = 0;

    requestAnimationFrame(() => {
      backdrop.scrollTop = 0;
      if (modalCard) modalCard.scrollTop = 0;
      if (modalBody) modalBody.scrollTop = 0;
    });
    setTimeout(() => {
      backdrop.scrollTop = 0;
      if (modalCard) modalCard.scrollTop = 0;
      if (modalBody) modalBody.scrollTop = 0;
    }, 40);
  }

  function goToStep(step) {
    bookingState.currentStep = step;
    document.querySelectorAll('.booking-step-panel').forEach(p => p.classList.remove('is-active'));
    const target = document.getElementById(`stepPanel${step}`);
    if (target) target.classList.add('is-active');

    if (step === 2) {
      renderSlots();
    }
    updateNavButtons();
    resetModalScroll();
  }

  // Formata data ISO para legível em português (ex: "Quarta-feira, 11 de Novembro")
  function formatHumanDate(isoDate) {
    if (!isoDate) return '';
    const [y, m, d] = isoDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return `${days[dateObj.getDay()]}, ${d} de ${months[m - 1]}`;
  }

  // Executa o agendamento
  function submitBooking() {
    bookingState.petName = document.getElementById('inputPetName').value.trim();
    bookingState.petBreed = document.getElementById('inputPetBreed').value.trim() || 'SRD / Vira-lata';
    bookingState.clientName = document.getElementById('inputClientName').value.trim();
    bookingState.clientPhone = document.getElementById('inputClientPhone').value.trim();
    bookingState.notes = document.getElementById('inputNotes').value.trim();

    // Salva no store compartilhado
    const record = BookingStore.create({
      service: bookingState.service,
      petSize: bookingState.petSize,
      date: bookingState.date,
      time: bookingState.time,
      petName: bookingState.petName,
      petBreed: bookingState.petBreed,
      clientName: bookingState.clientName,
      clientPhone: bookingState.clientPhone,
      notes: bookingState.notes
    });

    // Monta o comprovante visual
    const summaryContainer = document.getElementById('bookingTicketSummary');
    summaryContainer.innerHTML = `
      <div class="booking-ticket__row">
        <strong>Código da Reserva:</strong>
        <span>#${record.id}</span>
      </div>
      <div class="booking-ticket__row">
        <strong>Serviço Escolhido:</strong>
        <span>${record.service}</span>
      </div>
      <div class="booking-ticket__row">
        <strong>Pet:</strong>
        <span>${record.petName} (${record.petBreed} - ${record.petSize.split(' ')[0]})</span>
      </div>
      <div class="booking-ticket__row">
        <strong>Data &amp; Horário:</strong>
        <span>${formatHumanDate(record.date)} às ${record.time}</span>
      </div>
      <div class="booking-ticket__row">
        <strong>Tutor Responsável:</strong>
        <span>${record.clientName}</span>
      </div>
    `;

    // Monta link oficial do WhatsApp da Aupets
    const msg = `Olá equipe da Aupets Banho & Tosa! 🐾\n` +
      `Acabei de realizar um agendamento pelo site e quero confirmar:\n\n` +
      `📌 *Código:* #${record.id}\n` +
      `🐶 *Pet:* ${record.petName} (${record.petBreed} - ${record.petSize})\n` +
      `✂️ *Serviço:* ${record.service}\n` +
      `📅 *Data:* ${formatHumanDate(record.date)} às ${record.time}\n` +
      `👤 *Tutor:* ${record.clientName}\n` +
      `📱 *Contato:* ${record.clientPhone}\n` +
      (record.notes ? `📝 *Obs:* ${record.notes}\n\n` : `\n`) +
      `Agradeço desde já!`;

    const encodedMsg = encodeURIComponent(msg);
    const waBtn = document.getElementById('btnWhatsAppConfirmSend');
    waBtn.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMsg}`;

    goToStep(4);
  }

  function setupModalEvents() {
    const backdrop = document.getElementById('bookingModalBackdrop');
    const closeBtn = document.getElementById('modalCloseBtn');
    const btnPrev = document.getElementById('btnStepPrev');
    const btnNext = document.getElementById('btnStepNext');
    const dateInput = document.getElementById('bookingDateInput');

    // Fechar
    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeModal();
    });

    // Botão de envio WhatsApp na etapa final
    const waConfirmBtn = document.getElementById('btnWhatsAppConfirmSend');
    if (waConfirmBtn) {
      waConfirmBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        setTimeout(() => {
          closeModal();
        }, 1200);
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && backdrop.classList.contains('is-open')) {
        closeModal();
      }
    });

    // Mudança de Serviço
    document.querySelectorAll('input[name="bookingService"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        bookingState.service = e.target.value;
      });
    });

    // Mudança de Porte
    document.querySelectorAll('input[name="petSize"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        bookingState.petSize = e.target.value;
      });
    });

    // Mudança de Data
    dateInput.addEventListener('change', (e) => {
      bookingState.date = e.target.value;
      renderSlots();
    });

    // Validação nos inputs de contato
    ['inputPetName', 'inputClientName', 'inputClientPhone'].forEach(id => {
      const input = document.getElementById(id);
      if (input) {
        input.addEventListener('input', updateNavButtons);
      }
    });

    // Botões de navegação
    btnPrev.addEventListener('click', () => {
      if (bookingState.currentStep > 1) {
        goToStep(bookingState.currentStep - 1);
      }
    });

    btnNext.addEventListener('click', () => {
      if (bookingState.currentStep === 1) {
        goToStep(2);
      } else if (bookingState.currentStep === 2) {
        if (!bookingState.time) return;
        goToStep(3);
      } else if (bookingState.currentStep === 3) {
        submitBooking();
      }
    });
  }

  function openModal(preselectedService) {
    injectModalHTML();
    const backdrop = document.getElementById('bookingModalBackdrop');
    const dateInput = document.getElementById('bookingDateInput');

    // Define data mínima como hoje
    const today = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const todayISO = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    dateInput.min = todayISO;
    dateInput.value = bookingState.date || todayISO;

    // Pré-seleciona serviço se passado
    if (preselectedService) {
      const matchedRadio = document.querySelector(`input[name="bookingService"][value*="${preselectedService}"]`);
      if (matchedRadio) {
        matchedRadio.checked = true;
        bookingState.service = matchedRadio.value;
      }
    }

    goToStep(1);
    backdrop.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    const backdrop = document.getElementById('bookingModalBackdrop');
    if (backdrop) {
      backdrop.classList.remove('is-open');
      document.body.style.overflow = '';
      setTimeout(() => {
        bookingState.currentStep = 1;
        bookingState.time = '';
      }, 300);
    }
  }

  // Expõe no escopo global para acionamento pelos botões do site
  window.AupetsBooking = {
    open: openModal,
    close: closeModal
  };

  // Escuta atualizações de horários em tempo real
  window.addEventListener('aupets_sync', () => {
    if (bookingState.currentStep === 2) {
      renderSlots();
    }
  });

  // Vincula botões de agendamento na página
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-open-booking]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const service = btn.getAttribute('data-service') || '';
        openModal(service);
      });
    });
  });
})();
