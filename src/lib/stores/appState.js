export const appState = persisted('appstate', {}, { storage: 'local' });

// Pour stocker le from de la navigation
/**
 ** Je me demande si ça ne vaudrait pas la peine d'avoir un currentPatient et un currentSp parce que c'est fatiguant, dans quasiment tout les composants y'a un :
 ** const patient = $apge.find(gn) ...blablablabla
 ** const sp = paitent = page.fing(jenrzkgjn)
 ** C4est super relou et ça rend le code franchement pénible à la fin
 */
export const sessionState = persisted('sessionState', {}, { storage: 'local' });
