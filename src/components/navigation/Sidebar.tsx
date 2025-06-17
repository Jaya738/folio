import { useAppContext } from "../../context/AppContext";
import { SettingsMenu } from "./SettingsMenu";
import {
  Home,
  Receipt,
  PiggyBank,
  Repeat,
  Landmark,
  Handshake,
  Users,
  Target,
  ArrowLeftToLine,
  ArrowRightToLine,
} from "lucide-react";

const NavItem = ({
  icon,
  children,
  isExpanded,
  className = "",
  ...props
}: any) => (
  <button
    {...props}
    className={`flex items-center py-3 rounded-lg w-full text-left transition-colors duration-200 group ${
      isExpanded ? "px-4" : "px-0 justify-center"
    } ${className}`}
  >
    {icon}
    <span
      className={`whitespace-nowrap ml-4 transition-all duration-200 ${
        isExpanded ? "opacity-100" : "opacity-0 w-0"
      }`}
    >
      {isExpanded ? children : null}
    </span>
  </button>
);

const NavHeader = ({ children, isExpanded }: any) => (
  <p
    className={`px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mt-4 mb-1 transition-opacity ${
      isExpanded ? "opacity-100" : "opacity-0 h-0 pointer-events-none"
    }`}
  >
    {isExpanded ? children : null}
  </p>
);

export const Sidebar = ({
  user,
  isExpanded,
  setIsExpanded,
  currentView,
  onViewChange,
}: any) => {
  const { t } = useAppContext();

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-white/50 dark:bg-slate-800/50 p-4 flex flex-col border-r border-slate-200 dark:border-slate-700 transition-all duration-300 z-40 ${
        isExpanded ? "w-64" : "w-20"
      }`}
    >
      <div className="flex items-center mb-4">
        <h1
          className={`text-xl font-bold text-slate-900 dark:text-white overflow-hidden transition-all duration-300 ${
            isExpanded ? "w-full ml-3" : "w-0"
          }`}
        >
          Folio
        </h1>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 ml-auto hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
        >
          {isExpanded ? (
            <ArrowLeftToLine size={20} />
          ) : (
            <ArrowRightToLine size={20} />
          )}
        </button>
      </div>

      <nav className="flex-grow space-y-1">
        <NavItem
          isExpanded={isExpanded}
          onClick={() => onViewChange("dashboard")}
          className={
            currentView === "dashboard"
              ? "bg-cyan-500 text-white font-bold"
              : "text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          }
          icon={<Home size={22} />}
        >
          {t("dashboard")}
        </NavItem>
        <NavHeader isExpanded={isExpanded}>{t("spending")}</NavHeader>
        <NavItem
          isExpanded={isExpanded}
          onClick={() => onViewChange("transactions")}
          className={
            currentView === "transactions"
              ? "bg-cyan-500 text-white"
              : "text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          }
          icon={<Receipt size={22} />}
        >
          {t("expenses")}
        </NavItem>
        <NavItem
          isExpanded={isExpanded}
          onClick={() => onViewChange("budget")}
          className={
            currentView === "budget"
              ? "bg-cyan-500 text-white"
              : "text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          }
          icon={<PiggyBank size={22} />}
        >
          {t("budgets")}
        </NavItem>
        <NavItem
          isExpanded={isExpanded}
          onClick={() => onViewChange("cashflow")}
          className={
            currentView === "cashflow"
              ? "bg-cyan-500 text-white"
              : "text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          }
          icon={<Repeat size={22} />}
        >
          {t("cashFlow")}
        </NavItem>
        <NavHeader isExpanded={isExpanded}>{t("netWorth")}</NavHeader>
        <NavItem
          isExpanded={isExpanded}
          onClick={() => onViewChange("networth")}
          className={
            currentView === "networth"
              ? "bg-cyan-500 text-white"
              : "text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          }
          icon={<Landmark size={22} />}
        >
          {t("assets")} & {t("liabilities")}
        </NavItem>
        <NavItem
          isExpanded={isExpanded}
          onClick={() => onViewChange("lended")}
          className={
            currentView === "lended"
              ? "bg-cyan-500 text-white"
              : "text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          }
          icon={<Handshake size={22} />}
        >
          {t("lended")}
        </NavItem>
        <NavHeader isExpanded={isExpanded}>{t("planning")}</NavHeader>
        <NavItem
          isExpanded={isExpanded}
          onClick={() => onViewChange("family")}
          className={
            currentView === "family"
              ? "bg-cyan-500 text-white"
              : "text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          }
          icon={<Users size={22} />}
        >
          {t("family")}
        </NavItem>
        <NavItem
          isExpanded={isExpanded}
          onClick={() => onViewChange("goals")}
          className={
            currentView === "goals"
              ? "bg-cyan-500 text-white"
              : "text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          }
          icon={<Target size={22} />}
        >
          {t("goals")}
        </NavItem>
      </nav>

      <SettingsMenu />

      <div
        className={`text-xs text-slate-500 p-2 break-all transition-opacity ${
          isExpanded ? "opacity-100" : "opacity-0"
        }`}
      >
        <p className="font-semibold mb-1">User ID:</p>
        <p>{user?.uid}</p>
      </div>
    </aside>
  );
};
