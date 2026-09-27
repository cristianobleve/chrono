import nodemailer from "nodemailer";

export interface WorkspaceInviteEmailParams {
  to: string;
  workspaceName: string;
  inviterName: string;
  role: string;
  inviteUrl: string;
}

export interface PasswordRecoveryEmailParams {
  to: string;
  resetUrl: string;
}

export interface WelcomeEmailParams {
  to: string;
  name?: string;
  siteUrl?: string;
}

const REICON_ROCKET_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" class="reicon" style="color:#ffffff;display:block;"><path fill-rule="evenodd" clip-rule="evenodd" d="M17.4056 1.25004C17.4519 1.25007 17.4989 1.25009 17.5465 1.25009L18.167 1.25009C19.0386 1.25006 19.7673 1.25004 20.3462 1.32763C20.9578 1.40962 21.5134 1.59037 21.9605 2.03612C22.4079 2.48218 22.5896 3.03701 22.672 3.64789C22.7499 4.22551 22.7498 4.95241 22.7498 5.82101V6.44002C22.7498 6.4877 22.7498 6.53475 22.7499 6.58119C22.7504 7.63124 22.7508 8.36819 22.4707 9.04242C22.1906 9.71642 21.668 10.2369 20.9229 10.9791C20.89 11.0119 20.8566 11.0451 20.8228 11.0788L18.153 13.7406L18.2461 13.8843C18.6397 14.4923 18.9586 14.9848 19.1889 15.4095C19.4273 15.8494 19.5968 16.262 19.6646 16.7185C19.7737 17.4523 19.6751 18.2066 19.3858 18.8996C19.2785 19.1566 19.0929 19.4259 18.9026 19.6714C18.7031 19.9286 18.4593 20.2088 18.1974 20.4941C17.6762 21.0621 17.0504 21.686 16.495 22.2397L16.404 22.3305C15.684 23.0483 14.4361 22.8156 14.0522 21.8525C13.8245 21.2814 13.7324 21.0538 13.6171 20.8435C13.5102 20.6486 13.3875 20.4627 13.2503 20.2876C13.1042 20.1012 12.9335 19.9287 12.5102 19.5066L12.0054 19.064C11.9983 19.0578 11.9914 19.0515 11.9846 19.0451C11.8911 19.0572 11.7962 19.0634 11.6997 19.0634C11.0682 19.0634 10.5472 18.7998 10.0561 18.4262C9.59158 18.0729 9.0762 17.559 8.46002 16.9446L7.0134 15.5024C6.39726 14.8881 5.88183 14.3743 5.52735 13.911C5.15269 13.4215 4.88741 12.901 4.88741 12.2693C4.88741 12.1547 4.8962 12.0425 4.91329 11.9325L4.08287 11.1046C4.03445 11.0563 4.01506 11.037 3.99593 11.0185C3.62227 10.6559 3.18262 10.3675 2.70047 10.1689C2.67577 10.1587 2.6503 10.1486 2.58667 10.1234L2.20802 9.97334C1.19447 9.57173 0.92164 8.26365 1.69543 7.4922L1.70249 7.48516C2.25792 6.93141 2.88366 6.30756 3.4533 5.78791C3.73952 5.5268 4.02052 5.28373 4.27845 5.08494C4.52476 4.89509 4.79455 4.71029 5.05179 4.60356C5.74601 4.31552 6.50143 4.21738 7.2361 4.32595C7.693 4.39347 8.10622 4.56205 8.54733 4.79974C8.9732 5.02923 9.46709 5.34711 10.077 5.73965L10.2247 5.8347L12.8969 3.17043C12.9306 3.13686 12.9638 3.10371 12.9966 3.071C13.7414 2.32769 14.2632 1.80689 14.9386 1.52798C15.6138 1.24915 16.3517 1.24952 17.4056 1.25004ZM9.13735 6.91875C8.57734 6.55864 8.17425 6.30262 7.83578 6.12024C7.4767 5.92675 7.23621 5.84226 7.01681 5.80984C6.55867 5.74213 6.07732 5.80205 5.62665 5.98904C5.55933 6.01697 5.41759 6.10078 5.19416 6.27299C4.98234 6.43625 4.73539 6.6487 4.46422 6.89608C3.92148 7.39119 3.31755 7.9931 2.75448 8.55446C2.7513 8.55763 2.75029 8.55938 2.7502 8.55953C2.7501 8.5597 2.7502 8.55952 2.7502 8.55953C2.7501 8.55988 2.74939 8.56283 2.75033 8.56737C2.75127 8.57191 2.75297 8.5744 2.75343 8.57497C2.75371 8.57517 2.75614 8.57707 2.76059 8.57883L3.14432 8.73088C3.20135 8.75348 3.23668 8.76748 3.27188 8.78198C3.92982 9.05306 4.53008 9.44669 5.04048 9.94193C5.06779 9.96843 5.09469 9.99525 5.1381 10.0385L5.61586 10.5149C5.68125 10.4336 5.74953 10.353 5.82004 10.2725C6.14181 9.90528 6.55522 9.49312 7.03378 9.016L9.13735 6.91875ZM13.4544 18.3396L13.5352 18.4104L13.5868 18.4619C13.9774 18.8513 14.2195 19.0926 14.4309 19.3624C14.6184 19.6016 14.7861 19.8557 14.9322 20.1222C15.0919 20.4133 15.2156 20.7203 15.4087 21.2047L15.4289 21.1845C15.992 20.6231 16.5957 20.021 17.0923 19.4799C17.3404 19.2096 17.5535 18.9634 17.7172 18.7522C17.8899 18.5294 17.9738 18.3884 18.0016 18.3218C18.1888 17.8733 18.2487 17.3946 18.1809 16.9391C18.1486 16.7214 18.0641 16.4822 17.8702 16.1244C17.6869 15.7863 17.4295 15.3835 17.067 14.8233L14.9584 16.9256C14.4685 17.414 14.0465 17.8348 13.6707 18.1594C13.5989 18.2214 13.5269 18.2816 13.4544 18.3396ZM17.5465 2.75009C16.2947 2.75009 15.8771 2.7633 15.5112 2.9144C15.1455 3.06541 14.8413 3.35009 13.956 4.23268L8.10915 10.062C7.61071 10.5589 7.23286 10.9362 6.9482 11.2611C6.6622 11.5874 6.5162 11.8109 6.44522 11.9874C6.40383 12.0903 6.38741 12.1792 6.38741 12.2693C6.38741 12.4398 6.44582 12.643 6.71857 12.9994C7.00448 13.3731 7.44672 13.8162 8.10915 14.4767L8.26629 14.6333L9.79679 13.1074C10.0901 12.815 10.565 12.8157 10.8574 13.109C11.1499 13.4024 11.1492 13.8772 10.8559 14.1697L9.32855 15.6924L9.4825 15.8459C10.1449 16.5063 10.5894 16.9473 10.9643 17.2324C11.3217 17.5043 11.5267 17.5634 11.6997 17.5634C11.7845 17.5634 11.867 17.5491 11.9594 17.5151C12.1348 17.4505 12.3584 17.3107 12.6902 17.0241C13.0208 16.7387 13.4055 16.3557 13.9168 15.8459L19.7637 10.0166C20.6492 9.13374 20.9343 8.83068 21.0854 8.46692C21.2365 8.10341 21.2498 7.68861 21.2498 6.44002V5.87287C21.2498 4.93878 21.2482 4.31389 21.1854 3.84835C21.1256 3.40463 21.0229 3.21946 20.9014 3.09837C20.7797 2.97697 20.593 2.87414 20.1469 2.81434C19.6794 2.75167 19.0521 2.75009 18.1154 2.75009H17.5465ZM16.6635 7.32353C16.1978 6.85916 15.4417 6.85916 14.9759 7.32353C14.5114 7.78666 14.5114 8.53661 14.9759 8.99974C15.4417 9.46412 16.1978 9.46412 16.6635 8.99974C17.1281 8.53661 17.1281 7.78666 16.6635 7.32353ZM13.9168 6.26128C14.968 5.21324 16.6714 5.21324 17.7226 6.26128C18.7751 7.31056 18.7751 9.01271 17.7226 10.062C16.6714 11.11 14.968 11.11 13.9168 10.062C12.8644 9.01271 12.8644 7.31056 13.9168 6.26128Z" fill="currentColor"/></svg>`;

const REICON_SHIELD_TICK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" class="reicon" style="color:#ffffff;display:block;"><path d="M10.49 2.23006L5.50003 4.11006C4.35003 4.54006 3.41003 5.90006 3.41003 7.12006V14.5501C3.41003 15.7301 4.19003 17.2801 5.14003 17.9901L9.44003 21.2001C10.85 22.2601 13.17 22.2601 14.58 21.2001L18.88 17.9901C19.83 17.2801 20.61 15.7301 20.61 14.5501V7.12006C20.61 5.89006 19.67 4.53006 18.52 4.10006L13.53 2.23006C12.68 1.92006 11.32 1.92006 10.49 2.23006Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M9.05005 11.8701L10.66 13.4801L14.96 9.18005" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const REICON_SPARKLES_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" class="reicon" style="color:#ffffff;display:block;"><path d="M18.8179 2.08629C19.0253 1.45564 19.129 1.14031 19.2844 1.0552C19.4187 0.9816 19.5813 0.9816 19.7156 1.0552C19.871 1.14031 19.9747 1.45564 20.1821 2.08629L20.4973 3.04489C20.5389 3.17115 20.5596 3.23427 20.5953 3.28664C20.6269 3.33302 20.667 3.37305 20.7134 3.40467C20.7657 3.44037 20.8289 3.46113 20.9551 3.50265L21.9137 3.81792C22.5444 4.02533 22.8597 4.12903 22.9448 4.28437C23.0184 4.4187 23.0184 4.5813 22.9448 4.71563C22.8597 4.87097 22.5444 4.97467 21.9137 5.18208L20.9551 5.49735C20.8289 5.53887 20.7657 5.55963 20.7134 5.59533C20.667 5.62695 20.6269 5.66698 20.5953 5.71336C20.5596 5.76573 20.5389 5.82885 20.4973 5.95511L20.1821 6.91371C19.9747 7.54436 19.871 7.85969 19.7156 7.9448C19.5813 8.0184 19.4187 8.0184 19.2844 7.9448C19.129 7.85969 19.0253 7.54436 18.8179 6.91371L18.5027 5.95511C18.4611 5.82885 18.4404 5.76573 18.4047 5.71336C18.3731 5.66698 18.333 5.62695 18.2866 5.59533C18.2343 5.55963 18.1711 5.53887 18.0449 5.49735L17.0863 5.18208C16.4556 4.97467 16.1403 4.87097 16.0552 4.71563C15.9816 4.5813 15.9816 4.4187 16.0552 4.28437C16.1403 4.12903 16.4556 4.02533 17.0863 3.81792L18.0449 3.50265C18.1711 3.46113 18.2343 3.44037 18.2866 3.40467C18.333 3.37305 18.3731 3.33302 18.4047 3.28664C18.4404 3.23427 18.4611 3.17115 18.5027 3.04489L18.8179 2.08629Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M9.08515 3.4842C9.65508 3.17193 10.3449 3.17193 10.9149 3.4842C11.3659 3.73131 11.6146 4.22392 11.7946 4.64911C11.9901 5.11069 12.198 5.74283 12.4549 6.52401L13.2771 9.02398C13.3976 9.39037 13.4182 9.43092 13.4363 9.45748C13.4647 9.49923 13.5008 9.53527 13.5425 9.56373C13.5691 9.58183 13.6096 9.60243 13.976 9.72293L16.4759 10.5451C17.2571 10.802 17.8893 11.0099 18.3509 11.2054C18.7761 11.3854 19.2687 11.6341 19.5158 12.0851C19.8281 12.6551 19.8281 13.3449 19.5158 13.9149C19.2687 14.3659 18.7761 14.6146 18.3509 14.7946C17.8893 14.9901 17.2572 15.198 16.476 15.4549L13.976 16.2771C13.6096 16.3976 13.5691 16.4182 13.5425 16.4363C13.5008 16.4647 13.4647 16.5008 13.4363 16.5425C13.4182 16.5691 13.3976 16.6096 13.2771 16.976L12.4549 19.476C12.198 20.2571 11.9901 20.8893 11.7946 21.3509C11.6146 21.7761 11.3659 22.2687 10.9149 22.5158C10.3449 22.8281 9.65508 22.8281 9.08515 22.5158C8.63412 22.2687 8.38544 21.7761 8.20538 21.3509C8.00993 20.8893 7.80204 20.2572 7.54515 19.4761L6.72293 16.976C6.60243 16.6096 6.58183 16.5691 6.56373 16.5425C6.53527 16.5008 6.49923 16.4647 6.45748 16.4363C6.43092 16.4182 6.39037 16.3976 6.02398 16.2771L3.52404 15.4549C2.74287 15.198 2.11069 14.9901 1.64911 14.7946C1.22392 14.6146 0.731311 14.3659 0.484197 13.9149C0.171934 13.3449 0.171934 12.6551 0.484197 12.0851C0.731311 11.6341 1.22392 11.3854 1.64911 11.2054C2.11069 11.0099 2.74283 10.802 3.52401 10.5451L6.02398 9.72293C6.39037 9.60243 6.43092 9.58183 6.45748 9.56373C6.49923 9.53527 6.53527 9.49923 6.56373 9.45748C6.58183 9.43092 6.60243 9.39037 6.72293 9.02398L7.54511 6.52406C7.80202 5.74286 8.00992 5.1107 8.20538 4.64911C8.38544 4.22392 8.63412 3.73131 9.08515 3.4842ZM9.82073 4.79196C9.82034 4.79284 9.81872 4.79496 9.81589 4.79864C9.79592 4.82467 9.71576 4.92912 9.58664 5.23402C9.41848 5.63113 9.22965 6.20326 8.95853 7.02764L8.14785 9.49261L8.12768 9.55416C8.04188 9.81652 7.95663 10.0772 7.80314 10.3024C7.66901 10.4991 7.49915 10.669 7.30238 10.8031C7.07723 10.9566 6.81652 11.0419 6.55418 11.1277L6.49261 11.1478L4.02764 11.9585C3.20326 12.2297 2.63113 12.4185 2.23402 12.5866C1.92912 12.7158 1.82467 12.7959 1.79864 12.8159C1.79496 12.8187 1.79284 12.8203 1.79196 12.8207C1.73601 12.9337 1.73601 13.0663 1.79196 13.1793C1.79284 13.1797 1.79496 13.1813 1.79864 13.1841C1.82467 13.2041 1.92912 13.2842 2.23402 13.4134C2.63113 13.5815 3.20326 13.7703 4.02764 14.0415L6.49261 14.8522L6.55416 14.8723C6.81651 14.9581 7.07723 15.0434 7.30238 15.1969C7.49915 15.331 7.66901 15.5009 7.80314 15.6976C7.95663 15.9228 8.04188 16.1835 8.12768 16.4458L8.14785 16.5074L8.95853 18.9724C9.22965 19.7967 9.41848 20.3689 9.58664 20.766C9.71576 21.0709 9.79593 21.1753 9.8159 21.2014C9.81871 21.205 9.82035 21.2072 9.82073 21.208C9.93366 21.264 10.0663 21.264 10.1793 21.208C10.1795 21.2075 10.1802 21.2065 10.1814 21.2049C10.1821 21.204 10.183 21.2028 10.1841 21.2014C10.2041 21.1753 10.2842 21.0709 10.4134 20.766C10.5815 20.3689 10.7703 19.7967 11.0415 18.9724L11.8522 16.5074L11.8723 16.4458C11.9581 16.1835 12.0434 15.9228 12.1969 15.6976C12.331 15.5009 12.5009 15.331 12.6976 15.1969C12.9228 15.0434 13.1835 14.9581 13.4458 14.8723L13.5074 14.8522L15.9724 14.0415C16.7967 13.7703 17.3689 13.5815 17.766 13.4134C18.0709 13.2842 18.1753 13.2041 18.2014 13.1841C18.205 13.1813 18.2072 13.1797 18.208 13.1793C18.264 13.0663 18.264 12.9337 18.208 12.8207C18.2072 12.8203 18.2051 12.8187 18.2014 12.8159C18.1754 12.796 18.0709 12.7158 17.766 12.5866C17.3689 12.4185 16.7967 12.2297 15.9724 11.9585L13.5074 11.1478L13.4458 11.1277C13.1835 11.0419 12.9228 10.9566 12.6976 10.8031C12.5009 10.669 12.331 10.4991 12.1969 10.3024C12.0434 10.0772 11.9581 9.81651 11.8723 9.55416L11.8522 9.49261L11.0415 7.02764C10.7703 6.20326 10.5815 5.63113 10.4134 5.23402C10.2842 4.92912 10.2041 4.82467 10.1841 4.79864C10.1813 4.79496 10.1797 4.79284 10.1793 4.79196C10.0663 4.73601 9.93366 4.73601 9.82073 4.79196Z" fill="currentColor"/> <path d="M19.346 18.0394C19.235 18.1002 19.1609 18.3255 19.0128 18.7759L18.7876 19.4606C18.7579 19.5508 18.7431 19.5959 18.7176 19.6333C18.695 19.6664 18.6664 19.695 18.6333 19.7176C18.5959 19.7431 18.5508 19.7579 18.4606 19.7876L17.7759 20.0128C17.3255 20.1609 17.1002 20.235 17.0394 20.346C16.9869 20.4419 16.9869 20.5581 17.0394 20.654C17.1002 20.765 17.3255 20.8391 17.7759 20.9872L18.4606 21.2124C18.5508 21.2421 18.5959 21.2569 18.6333 21.2824C18.6664 21.305 18.695 21.3336 18.7176 21.3667C18.7431 21.4041 18.7579 21.4492 18.7876 21.5394L19.0128 22.2241C19.1609 22.6745 19.235 22.8998 19.346 22.9606C19.4419 23.0131 19.5581 23.0131 19.654 22.9606C19.765 22.8998 19.8391 22.6745 19.9872 22.2241L20.2124 21.5394C20.2421 21.4492 20.2569 21.4041 20.2824 21.3667C20.305 21.3336 20.3336 21.305 20.3667 21.2824C20.4041 21.2569 20.4492 21.2421 20.5394 21.2124L21.2241 20.9872C21.6745 20.8391 21.8998 20.765 21.9606 20.654C22.0131 20.5581 22.0131 20.4419 21.9606 20.346C21.8998 20.235 21.6745 20.1609 21.2241 20.0128L20.5394 19.7876C20.4492 19.7579 20.4041 19.7431 20.3667 19.7176C20.3336 19.695 20.305 19.6664 20.2824 19.6333C20.2569 19.5959 20.2421 19.5508 20.2124 19.4606L19.9872 18.7759C19.8391 18.3255 19.765 18.1002 19.654 18.0394C19.5581 17.9869 19.4419 17.9869 19.346 18.0394Z" fill="currentColor"/></svg>`;

const CHRONO_FOOTER_LOGO_SVG = `<div style="width:34px;height:34px;border-radius:8px;background-color:#18181b;border:1px solid #27272a;text-align:center;line-height:32px;display:inline-block;">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="22" height="22" fill="none" style="vertical-align:middle;display:inline-block;">
    <path d="M 50 16 C 31.222 16 16 31.222 16 50 C 16 68.778 31.222 84 50 84 C 68.778 84 84 68.778 84 50 C 84 41.075 80.6 32.83 75.075 26.625 L 65.725 35.975 C 69.38 39.8 71.675 44.9 71.675 50 C 71.675 61.97 61.97 71.675 50 71.675 C 38.03 71.675 28.325 61.97 28.325 50 C 28.325 38.03 38.03 28.325 50 28.325 C 55.1 28.325 60.2 30.62 64.025 34.275 L 73.375 24.925 C 67.17 19.4 58.925 16 50 16 Z" fill="#ffffff" />
    <path d="M 46 35 L 65 23 L 54 54 L 35 65 L 46 35 Z" fill="#ffffff" />
    <circle cx="50" cy="50" r="4" fill="#18181b" stroke="#ffffff" stroke-width="2.5" />
  </svg>
</div>`;

function getTransporter() {
  const host = process.env.SMTP_HOST || "smtp.resend.com";
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER || "resend";
  const pass = process.env.SMTP_PASS;

  if (!pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}

function getFromAddress() {
  const rawFrom = process.env.SMTP_FROM || "Chrono <chrono@cristianobleve.com>";
  if (rawFrom.includes("<") && rawFrom.includes(">")) {
    return rawFrom;
  }
  const parts = rawFrom.trim().split(/\s+/);
  const emailPart = parts.find((p) => p.includes("@"));
  if (emailPart && parts.length > 1) {
    const namePart = parts.filter((p) => p !== emailPart).join(" ");
    return `${namePart} <${emailPart}>`;
  }
  return rawFrom;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatRole(role: string): string {
  const normalized = (role || "").toLowerCase().trim();
  switch (normalized) {
    case "owner":
      return "Owner";
    case "admin":
      return "Admin";
    case "guest":
      return "Guest";
    case "member":
    default:
      return "Member";
  }
}

function getBaseStyles(): string {
  return `
    @import url('https://fonts.cristianobleve.com/TestSöhne-Buch.otf');
    @import url('https://fonts.cristianobleve.com/TestSöhne-Halbfett.otf');
    @import url('https://fonts.cristianobleve.com/InterDisplay-Regular.woff2');
    @import url('https://fonts.cristianobleve.com/InterDisplay-SemiBold.woff2');

    @font-face {
      font-family: 'Söhne';
      src: url('https://fonts.cristianobleve.com/TestSöhne-Buch.otf') format('opentype');
      font-weight: 400;
      font-style: normal;
    }
    @font-face {
      font-family: 'Söhne';
      src: url('https://fonts.cristianobleve.com/TestSöhne-Halbfett.otf') format('opentype');
      font-weight: 600;
      font-style: normal;
    }
    @font-face {
      font-family: 'Inter Display';
      src: url('https://fonts.cristianobleve.com/InterDisplay-Regular.woff2') format('woff2');
      font-weight: 400;
      font-style: normal;
    }
    @font-face {
      font-family: 'Inter Display';
      src: url('https://fonts.cristianobleve.com/InterDisplay-SemiBold.woff2') format('woff2');
      font-weight: 600;
      font-style: normal;
    }

    body, table, td, p, a, span {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
      font-family: 'Söhne', 'Inter Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    body {
      margin: 0;
      padding: 0;
      width: 100% !important;
      background-color: #09090b;
      color: #f4f4f5;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      outline: none;
      text-decoration: none;
    }
    .mono {
      font-family: 'Geist Mono', 'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', monospace !important;
    }
    @media only screen and (max-width: 600px) {
      .email-wrapper {
        padding: 24px 12px !important;
      }
      .email-card {
        padding: 24px 20px !important;
        border-radius: 12px !important;
      }
      .email-title {
        font-size: 22px !important;
      }
    }
  `;
}

function renderGoogleDocsStyleFooter(options: {
  userEmail?: string;
  isShort?: boolean;
}): string {
  const currentYear = new Date().getFullYear();
  const emailEscaped = escapeHtml(options.userEmail || "your-email@example.com");

  if (options.isShort) {
    return `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-top:1px solid #27272a;padding-top:24px;margin-top:32px;">
        <tr>
          <td align="left" style="vertical-align:top;padding-right:20px;">
            <p style="margin:0 0 10px 0;font-size:11px;line-height:1.6;color:#71717a;">
              For your security, this link can only be used once and expires in 24 hours. If you didn't make this request, ignore this email or contact support.
            </p>
            <p style="margin:0;font-size:11px;line-height:1.5;color:#52525b;">
              &copy; ${currentYear} Chrono - cristianobleve.com
            </p>
          </td>
          <td align="right" style="vertical-align:top;width:40px;">
            ${CHRONO_FOOTER_LOGO_SVG}
          </td>
        </tr>
      </table>
    `;
  }

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-top:1px solid #27272a;padding-top:24px;margin-top:32px;">
      <tr>
        <td align="left" style="vertical-align:top;padding-right:20px;">
          <p style="margin:0 0 6px 0;font-size:11px;line-height:1.6;color:#71717a;">
            This email was sent to <span style="color:#a1a1aa;">${emailEscaped}</span> because you have an account on Chrono.
          </p>
          <p style="margin:0 0 12px 0;font-size:11px;line-height:1.6;color:#71717a;">
            If you didn't request this, you can safely ignore this email - no changes have been made to your account.
          </p>
          <p style="margin:0 0 10px 0;font-size:11px;line-height:1.5;color:#52525b;">
            &copy; ${currentYear} Chrono, part of cristianobleve.com. All rights reserved.
          </p>
          <p style="margin:0;font-size:11px;line-height:1.5;">
            <a href="https://chrono.cristianobleve.com/resources" target="_blank" style="color:#a1a1aa;text-decoration:none;margin-right:14px;">Help Center</a>
            <a href="https://chrono.cristianobleve.com/security" target="_blank" style="color:#a1a1aa;text-decoration:none;margin-right:14px;">Privacy Policy</a>
            <a href="https://chrono.cristianobleve.com/settings/preferences" target="_blank" style="color:#a1a1aa;text-decoration:none;">Unsubscribe from notifications</a>
          </p>
        </td>
        <td align="right" style="vertical-align:top;width:40px;">
          ${CHRONO_FOOTER_LOGO_SVG}
        </td>
      </tr>
    </table>
  `;
}

export function renderWorkspaceInviteEmailHtml(params: WorkspaceInviteEmailParams): {
  subject: string;
  text: string;
  html: string;
} {
  const workspaceName = escapeHtml(params.workspaceName);
  const inviterName = escapeHtml(params.inviterName);
  const roleLabel = formatRole(params.role);
  const inviteUrl = params.inviteUrl;

  const subject = `You're invited to ${params.workspaceName} - as ${roleLabel}`;
  const preheader = `${params.inviterName} wants you on the team.`;

  const currentYear = new Date().getFullYear();

  const text = [
    `Join ${params.workspaceName}`,
    ``,
    `${params.inviterName} invited you to join and collaborate in the ${params.workspaceName} workspace as ${roleLabel} - full visibility into projects, issues, and the roadmap.`,
    ``,
    `Workspace: ${params.workspaceName}`,
    `Assigned role: ${roleLabel}`,
    `Expires in: 7 days`,
    ``,
    `Accept invitation:`,
    inviteUrl,
    ``,
    `This email was sent to ${params.to} because you have an account on Chrono.`,
    `If you didn't request this, you can safely ignore this email - no changes have been made to your account.`,
    ``,
    `© ${currentYear} Chrono, part of cristianobleve.com. All rights reserved.`,
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${escapeHtml(subject)}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    ${getBaseStyles()}
  </style>
</head>
<body style="margin:0;padding:0;background-color:#09090b;color:#f4f4f5;">
  <div style="display:none;font-size:1px;color:#09090b;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${escapeHtml(preheader)}
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="email-wrapper" style="background-color:#09090b;padding:48px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="email-card" style="max-width:540px;background-color:#121316;border:1px solid #27272a;border-radius:14px;padding:36px;text-align:left;">
          
          <!-- Header Bar -->
          <tr>
            <td style="padding-bottom:24px;border-bottom:1px solid #27272a;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="left" style="vertical-align:middle;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="vertical-align:middle;padding-right:10px;">
                          <div style="width:26px;height:26px;border-radius:6px;background-color:#ffffff;text-align:center;line-height:26px;">
                            <span style="font-family:'Söhne','Inter Display',sans-serif;font-weight:800;font-size:14px;color:#09090b;">C</span>
                          </div>
                        </td>
                        <td style="vertical-align:middle;">
                          <span style="font-family:'Söhne','Inter Display',sans-serif;font-size:13px;font-weight:700;letter-spacing:0.12em;color:#ffffff;text-transform:uppercase;">CHRONO</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <span class="mono" style="font-size:10px;font-weight:600;color:#71717a;letter-spacing:0.06em;text-transform:uppercase;">INVITATION</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Area -->
          <tr>
            <td style="padding-top:28px;">

              <!-- Festive Badge -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td style="background-color:#1c1d22;border:1px solid #2e3038;border-radius:100px;padding:6px 14px 6px 10px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="vertical-align:middle;padding-right:8px;line-height:0;">
                          ${REICON_ROCKET_SVG}
                        </td>
                        <td style="vertical-align:middle;font-size:12px;font-weight:600;color:#ffffff;letter-spacing:0.02em;">
                          Hooray! You're in.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Heading -->
              <h1 class="email-title" style="margin:0 0 12px 0;font-size:24px;font-weight:700;color:#ffffff;line-height:1.25;letter-spacing:-0.02em;">
                Join ${workspaceName}
              </h1>

              <!-- Description -->
              <p style="margin:0 0 24px 0;font-size:14px;line-height:1.6;color:#a1a1aa;">
                ${inviterName} invited you to join and collaborate in the ${workspaceName} workspace as <strong style="color:#ffffff;">${roleLabel}</strong> - full visibility into projects, issues, and the roadmap.
              </p>

              <!-- Workspace Detail Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#18181b;border:1px solid #27272a;border-radius:10px;padding:16px 18px;margin-bottom:26px;">
                <tr>
                  <td style="padding-bottom:10px;border-bottom:1px solid #27272a;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="font-size:11px;color:#71717a;text-transform:uppercase;letter-spacing:0.04em;font-weight:600;">Workspace</td>
                        <td align="right" style="font-size:13px;font-weight:600;color:#ffffff;">${workspaceName}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:10px;padding-bottom:10px;border-bottom:1px solid #27272a;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="font-size:11px;color:#71717a;text-transform:uppercase;letter-spacing:0.04em;font-weight:600;">Assigned role</td>
                        <td align="right">
                          <span class="mono" style="display:inline-block;background-color:#27272a;border:1px solid #3f3f46;border-radius:4px;padding:2px 8px;font-size:11px;font-weight:600;color:#ffffff;">
                            ${roleLabel}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:10px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="font-size:11px;color:#71717a;text-transform:uppercase;letter-spacing:0.04em;font-weight:600;">Expires in</td>
                        <td align="right" style="font-size:12px;color:#a1a1aa;">7 days</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Action Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 28px 0;">
                <tr>
                  <td align="left" style="border-radius:8px;background-color:#ffffff;">
                    <a href="${escapeHtml(inviteUrl)}" target="_blank" style="display:inline-block;padding:12px 24px;font-family:'Söhne','Inter Display',sans-serif;font-size:13px;font-weight:600;color:#09090b;text-decoration:none;border-radius:8px;letter-spacing:-0.01em;">
                      Accept invitation
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback Direct URL -->
              <div style="background-color:#09090b;border:1px solid #27272a;border-radius:8px;padding:14px;margin-bottom:24px;">
                <p style="margin:0 0 6px 0;font-size:11px;color:#71717a;line-height:1.4;">
                  If the button above does not open, copy and paste this link into your browser:
                </p>
                <p class="mono" style="margin:0;font-size:11px;line-height:1.5;color:#e4e4e7;word-break:break-all;">
                  ${escapeHtml(inviteUrl)}
                </p>
              </div>

              <!-- Google Docs Sharing Style Footer -->
              ${renderGoogleDocsStyleFooter({ userEmail: params.to, isShort: false })}

            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, text, html };
}

export function renderPasswordRecoveryEmailHtml(params: PasswordRecoveryEmailParams): {
  subject: string;
  text: string;
  html: string;
} {
  const resetUrl = params.resetUrl;
  const subject = "Reset your Chrono password";
  const preheader = "This link expires in 24 hours.";

  const currentYear = new Date().getFullYear();

  const text = [
    `Let's get you back in`,
    ``,
    `We received a request to reset the password for your Chrono account. Click the button below to choose a new one and return to your workspace.`,
    ``,
    `Request: Password reset`,
    `Valid for: 24 hours`,
    ``,
    `Reset Password:`,
    resetUrl,
    ``,
    `For your security, this link can only be used once and expires in 24 hours. If you didn't make this request, ignore this email or contact support.`,
    ``,
    `© ${currentYear} Chrono - cristianobleve.com`,
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${escapeHtml(subject)}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    ${getBaseStyles()}
  </style>
</head>
<body style="margin:0;padding:0;background-color:#09090b;color:#f4f4f5;">
  <div style="display:none;font-size:1px;color:#09090b;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${escapeHtml(preheader)}
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="email-wrapper" style="background-color:#09090b;padding:48px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="email-card" style="max-width:540px;background-color:#121316;border:1px solid #27272a;border-radius:14px;padding:36px;text-align:left;">
          
          <!-- Header Bar -->
          <tr>
            <td style="padding-bottom:24px;border-bottom:1px solid #27272a;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="left" style="vertical-align:middle;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="vertical-align:middle;padding-right:10px;">
                          <div style="width:26px;height:26px;border-radius:6px;background-color:#ffffff;text-align:center;line-height:26px;">
                            <span style="font-family:'Söhne','Inter Display',sans-serif;font-weight:800;font-size:14px;color:#09090b;">C</span>
                          </div>
                        </td>
                        <td style="vertical-align:middle;">
                          <span style="font-family:'Söhne','Inter Display',sans-serif;font-size:13px;font-weight:700;letter-spacing:0.12em;color:#ffffff;text-transform:uppercase;">CHRONO</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <span class="mono" style="font-size:10px;font-weight:600;color:#71717a;letter-spacing:0.06em;text-transform:uppercase;">SECURITY</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Area -->
          <tr>
            <td style="padding-top:28px;">

              <!-- Security Badge -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td style="background-color:#1c1d22;border:1px solid #2e3038;border-radius:100px;padding:6px 14px 6px 10px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="vertical-align:middle;padding-right:8px;line-height:0;">
                          ${REICON_SHIELD_TICK_SVG}
                        </td>
                        <td style="vertical-align:middle;font-size:12px;font-weight:600;color:#ffffff;letter-spacing:0.02em;">
                          Security Verification
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Heading -->
              <h1 class="email-title" style="margin:0 0 12px 0;font-size:24px;font-weight:700;color:#ffffff;line-height:1.25;letter-spacing:-0.02em;">
                Let's get you back in
              </h1>

              <!-- Description -->
              <p style="margin:0 0 24px 0;font-size:14px;line-height:1.6;color:#a1a1aa;">
                We received a request to reset the password for your Chrono account. Click the button below to choose a new one and return to your workspace.
              </p>

              <!-- Reset Detail Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#18181b;border:1px solid #27272a;border-radius:10px;padding:16px 18px;margin-bottom:26px;">
                <tr>
                  <td style="padding-bottom:10px;border-bottom:1px solid #27272a;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="font-size:11px;color:#71717a;text-transform:uppercase;letter-spacing:0.04em;font-weight:600;">Request</td>
                        <td align="right" style="font-size:13px;font-weight:600;color:#ffffff;">Password reset</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:10px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="font-size:11px;color:#71717a;text-transform:uppercase;letter-spacing:0.04em;font-weight:600;">Valid for</td>
                        <td align="right" style="font-size:12px;color:#a1a1aa;">24 hours</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Action Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 28px 0;">
                <tr>
                  <td align="left" style="border-radius:8px;background-color:#ffffff;">
                    <a href="${escapeHtml(resetUrl)}" target="_blank" style="display:inline-block;padding:12px 24px;font-family:'Söhne','Inter Display',sans-serif;font-size:13px;font-weight:600;color:#09090b;text-decoration:none;border-radius:8px;letter-spacing:-0.01em;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback Direct URL -->
              <div style="background-color:#09090b;border:1px solid #27272a;border-radius:8px;padding:14px;margin-bottom:24px;">
                <p style="margin:0 0 6px 0;font-size:11px;color:#71717a;line-height:1.4;">
                  If the button above does not open, copy and paste this link into your browser:
                </p>
                <p class="mono" style="margin:0;font-size:11px;line-height:1.5;color:#e4e4e7;word-break:break-all;">
                  ${escapeHtml(resetUrl)}
                </p>
              </div>

              <!-- Google Docs Sharing Style Footer (Short Version) -->
              ${renderGoogleDocsStyleFooter({ isShort: true })}

            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, text, html };
}

export function renderWelcomeEmailHtml(params: WelcomeEmailParams): {
  subject: string;
  text: string;
  html: string;
} {
  const name = params.name ? escapeHtml(params.name) : "there";
  const siteUrl = params.siteUrl || "https://chrono.cristianobleve.com";
  const subject = `Welcome aboard, ${params.name || "there"}`;
  const preheader = "Your workspace is live and ready to go.";

  const currentYear = new Date().getFullYear();

  const text = [
    `Ready to ship with direction`,
    ``,
    `Hi ${params.name || "there"}, your Chrono account is all set. You now have a unified system to manage projects, resolve issues, and coordinate your roadmap.`,
    ``,
    `Status: Active`,
    `Capabilities: Projects, Issues, Timeline & AI Agent`,
    ``,
    `Launch Chrono Workspace:`,
    siteUrl,
    ``,
    `This email was sent to ${params.to} because you have an account on Chrono.`,
    `If you didn't request this, you can safely ignore this email - no changes have been made to your account.`,
    ``,
    `© ${currentYear} Chrono, part of cristianobleve.com. All rights reserved.`,
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${escapeHtml(subject)}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    ${getBaseStyles()}
  </style>
</head>
<body style="margin:0;padding:0;background-color:#09090b;color:#f4f4f5;">
  <div style="display:none;font-size:1px;color:#09090b;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${escapeHtml(preheader)}
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="email-wrapper" style="background-color:#09090b;padding:48px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="email-card" style="max-width:540px;background-color:#121316;border:1px solid #27272a;border-radius:14px;padding:36px;text-align:left;">
          
          <!-- Header Bar -->
          <tr>
            <td style="padding-bottom:24px;border-bottom:1px solid #27272a;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="left" style="vertical-align:middle;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="vertical-align:middle;padding-right:10px;">
                          <div style="width:26px;height:26px;border-radius:6px;background-color:#ffffff;text-align:center;line-height:26px;">
                            <span style="font-family:'Söhne','Inter Display',sans-serif;font-weight:800;font-size:14px;color:#09090b;">C</span>
                          </div>
                        </td>
                        <td style="vertical-align:middle;">
                          <span style="font-family:'Söhne','Inter Display',sans-serif;font-size:13px;font-weight:700;letter-spacing:0.12em;color:#ffffff;text-transform:uppercase;">CHRONO</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <span class="mono" style="font-size:10px;font-weight:600;color:#71717a;letter-spacing:0.06em;text-transform:uppercase;">WELCOME</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Area -->
          <tr>
            <td style="padding-top:28px;">

              <!-- Festive Badge -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td style="background-color:#1c1d22;border:1px solid #2e3038;border-radius:100px;padding:6px 14px 6px 10px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="vertical-align:middle;padding-right:8px;line-height:0;">
                          ${REICON_SPARKLES_SVG}
                        </td>
                        <td style="vertical-align:middle;font-size:12px;font-weight:600;color:#ffffff;letter-spacing:0.02em;">
                          Hooray! You're in.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Heading -->
              <h1 class="email-title" style="margin:0 0 12px 0;font-size:24px;font-weight:700;color:#ffffff;line-height:1.25;letter-spacing:-0.02em;">
                Ready to ship with direction
              </h1>

              <!-- Description -->
              <p style="margin:0 0 24px 0;font-size:14px;line-height:1.6;color:#a1a1aa;">
                Hi ${name}, your Chrono account is all set. You now have a unified system to manage projects, resolve issues, and coordinate your roadmap.
              </p>

              <!-- Account Detail Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#18181b;border:1px solid #27272a;border-radius:10px;padding:16px 18px;margin-bottom:26px;">
                <tr>
                  <td style="padding-bottom:10px;border-bottom:1px solid #27272a;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="font-size:11px;color:#71717a;text-transform:uppercase;letter-spacing:0.04em;font-weight:600;">Status</td>
                        <td align="right" style="font-size:13px;font-weight:600;color:#ffffff;">Active</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:10px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="font-size:11px;color:#71717a;text-transform:uppercase;letter-spacing:0.04em;font-weight:600;">Capabilities</td>
                        <td align="right" style="font-size:12px;color:#a1a1aa;">Projects, Issues, Timeline & AI Agent</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Action Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 28px 0;">
                <tr>
                  <td align="left" style="border-radius:8px;background-color:#ffffff;">
                    <a href="${escapeHtml(siteUrl)}" target="_blank" style="display:inline-block;padding:12px 24px;font-family:'Söhne','Inter Display',sans-serif;font-size:13px;font-weight:600;color:#09090b;text-decoration:none;border-radius:8px;letter-spacing:-0.01em;">
                      Launch Chrono Workspace
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Google Docs Sharing Style Footer -->
              ${renderGoogleDocsStyleFooter({ userEmail: params.to, isShort: false })}

            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, text, html };
}

export async function sendWorkspaceInviteEmail(
  params: WorkspaceInviteEmailParams
): Promise<{ sent: boolean; error?: string }> {
  const transporter = getTransporter();
  if (!transporter) {
    return { sent: false, error: "SMTP_PASS is not configured on the server." };
  }

  const { subject, text, html } = renderWorkspaceInviteEmailHtml(params);

  try {
    await transporter.sendMail({
      from: getFromAddress(),
      to: params.to,
      subject,
      text,
      html,
    });
    return { sent: true };
  } catch (err: any) {
    console.error("[Mailer] sendWorkspaceInviteEmail error:", err);
    return { sent: false, error: err?.message || "Failed to send email via SMTP." };
  }
}

export async function sendPasswordRecoveryEmail(
  params: PasswordRecoveryEmailParams
): Promise<{ sent: boolean; error?: string }> {
  const transporter = getTransporter();
  if (!transporter) {
    return { sent: false, error: "SMTP_PASS is not configured on the server." };
  }

  const { subject, text, html } = renderPasswordRecoveryEmailHtml(params);

  try {
    await transporter.sendMail({
      from: getFromAddress(),
      to: params.to,
      subject,
      text,
      html,
    });
    return { sent: true };
  } catch (err: any) {
    console.error("[Mailer] sendPasswordRecoveryEmail error:", err);
    return { sent: false, error: err?.message || "Failed to send email via SMTP." };
  }
}

export async function sendWelcomeEmail(
  params: WelcomeEmailParams
): Promise<{ sent: boolean; error?: string }> {
  const transporter = getTransporter();
  if (!transporter) {
    return { sent: false, error: "SMTP_PASS is not configured on the server." };
  }

  const { subject, text, html } = renderWelcomeEmailHtml(params);

  try {
    await transporter.sendMail({
      from: getFromAddress(),
      to: params.to,
      subject,
      text,
      html,
    });
    return { sent: true };
  } catch (err: any) {
    console.error("[Mailer] sendWelcomeEmail error:", err);
    return { sent: false, error: err?.message || "Failed to send email via SMTP." };
  }
}
