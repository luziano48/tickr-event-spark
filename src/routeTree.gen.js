import { Route as rootRouteImport } from "./routes/__root";
import { Route as IndexRouteImport } from "./routes/index";
import { Route as ExplorarRouteImport } from "./routes/explorar";
import { Route as CriarRouteImport } from "./routes/criar";
import { Route as MensagensRouteImport } from "./routes/mensagens";
import { Route as IngressosRouteImport } from "./routes/ingressos";
import { Route as PerfilRouteImport } from "./routes/perfil";
import { Route as ScannerRouteImport } from "./routes/scanner";
import { Route as EventoIdRouteImport } from "./routes/evento.$id";
const IndexRoute = IndexRouteImport.update({
  id: "/",
  path: "/",
  getParentRoute: () => rootRouteImport,
});
const ExplorarRoute = ExplorarRouteImport.update({
  id: "/explorar",
  path: "/explorar",
  getParentRoute: () => rootRouteImport,
});
const IngressosRoute = IngressosRouteImport.update({
  id: "/ingressos",
  path: "/ingressos",
  getParentRoute: () => rootRouteImport,
});
const CriarRoute = CriarRouteImport.update({
  id: "/criar",
  path: "/criar",
  getParentRoute: () => rootRouteImport,
});
const MensagensRoute = MensagensRouteImport.update({
  id: "/mensagens",
  path: "/mensagens",
  getParentRoute: () => rootRouteImport,
});
const PerfilRoute = PerfilRouteImport.update({
  id: "/perfil",
  path: "/perfil",
  getParentRoute: () => rootRouteImport,
});
const ScannerRoute = ScannerRouteImport.update({
  id: "/scanner",
  path: "/scanner",
  getParentRoute: () => rootRouteImport,
});
const EventoIdRoute = EventoIdRouteImport.update({
  id: "/evento/$id",
  path: "/evento/$id",
  getParentRoute: () => rootRouteImport,
});
const rootRouteChildren = {
  IndexRoute,
  ExplorarRoute,
  CriarRoute,
  MensagensRoute,
  IngressosRoute,
  PerfilRoute,
  ScannerRoute,
  EventoIdRoute,
};
export const routeTree = rootRouteImport._addFileChildren(rootRouteChildren);
