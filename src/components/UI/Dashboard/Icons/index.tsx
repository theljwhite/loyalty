type IconProps = {
  color: string;
  size?: number | string;
};

export const HomeIcon = ({ color, size }: IconProps): JSX.Element => (
  <svg
    fill={color}
    width={size}
    height={size}
    enableBackground="new 0 0 32 32"
    id="Layer_1"
    version="1.1"
    viewBox="0 0 32 32"
    xmlSpace="preserve"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
  >
    <path d="M29.707,15.793l-13-13c-0.391-0.391-1.023-0.391-1.414,0l-13,13c-0.391,0.391-0.391,1.023,0,1.414s1.023,0.391,1.414,0  L16,4.914l8.014,8.014C24.013,12.953,24,12.975,24,13v15H8V18c0-0.553-0.448-1-1-1s-1,0.447-1,1v11c0,0.553,0.448,1,1,1h18  c0.553,0,1-0.447,1-1V14.914l2.293,2.293C28.488,17.402,28.744,17.5,29,17.5s0.512-0.098,0.707-0.293  C30.098,16.816,30.098,16.184,29.707,15.793z" />
  </svg>
);

export const WalletIcon = ({ color, size }: IconProps): JSX.Element => (
  <svg
    width={size}
    height={size}
    fill={color}
    enableBackground="new 0 0 48 48"
    id="Layer_1"
    version="1.1"
    viewBox="0 0 48 48"
    xmlSpace="preserve"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
  >
    <path
      clipRule="evenodd"
      d="M47,40L47,40c0,2.762-2.238,5-5,5l0,0H6l0,0c-2.762,0-5-2.238-5-5V11  c0-2.209,1.791-4,4-4l0,0h20.171l8.099-2.934c0.513-0.187,1.081,0.078,1.268,0.589L35.391,7H39c2.209,0,4,1.791,4,4v2l0,0  c2.209,0,4,1.791,4,4V40z M5,9L5,9c-1.104,0-2,0.896-2,2s0.896,2,2,2h3.445l0,0h0.189c0.013-0.005,0.021-0.016,0.034-0.021L19.65,9  H5z M34.078,9.181l-1.062-2.924l-0.001,0v0L30.964,7h0.003l-5.514,2h-0.01l-11.039,4h21.062L34.078,9.181z M41,11  c0-1.104-0.896-2-2-2h-2.883l1.454,4H41l0,0V11z M43,15H5l0,0c-0.732,0-1.41-0.211-2-0.555V40c0,1.657,1.344,3,3,3h36  c1.657,0,3-1.343,3-3v-7h-4c-2.209,0-4-1.791-4-4s1.791-4,4-4h4v-8C45,15.896,44.104,15,43,15z M45,31v-4h-4c-1.104,0-2,0.896-2,2  s0.896,2,2,2H45z M41,28h2v2h-2V28z"
      fillRule="evenodd"
    />
  </svg>
);

export const ChainIcon = ({ color, size }: IconProps): JSX.Element => (
  <svg
    width={size}
    height={size}
    fill={color}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title />
    <g data-name="Layer 2" id="Layer_2">
      <path d="M18.89,3.69a3.82,3.82,0,0,0-4.6.6l-2,2a3.82,3.82,0,0,0-.6,4.6l-.8.8a3.82,3.82,0,0,0-4.6.6l-2,2a3.82,3.82,0,0,0-.6,4.6l-2.4,2.4,1.41,1.41,2.4-2.4a3.79,3.79,0,0,0,4.6-.6l2-2a3.82,3.82,0,0,0,.6-4.6l.8-.8a3.79,3.79,0,0,0,4.6-.6l2-2a3.82,3.82,0,0,0,.6-4.6l2.4-2.4L21.29,1.29Zm-8.6,12.6-2,2a1.83,1.83,0,0,1-1.67.49l1.08-1.08L6.29,16.29,5.21,17.37a1.83,1.83,0,0,1,.49-1.67l2-2a1.81,1.81,0,0,1,1.67-.49L8.29,14.29l1.41,1.41,1.08-1.08A1.83,1.83,0,0,1,10.29,16.29Zm8-8-2,2a1.83,1.83,0,0,1-1.67.49l1.08-1.08L14.29,8.29,13.21,9.37a1.83,1.83,0,0,1,.49-1.67l2-2a1.81,1.81,0,0,1,1.67-.49L16.29,6.29l1.41,1.41,1.08-1.08A1.83,1.83,0,0,1,18.29,8.29Z" />
    </g>
  </svg>
);

export const AnalyticsIconOne = ({ color, size }: IconProps): JSX.Element => (
  <svg
    width={size}
    height={size}
    fill={color}
    color={color}
    viewBox="0 0 170 99"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clipPath="url(#clip0)">
      <path
        d="M159.524 0.393145C156.399 0.123788 154.058 0.750571 152.37 2.30179C150.171 4.32164 149.108 7.85474 149.031 13.4077C147.212 15.4816 145.399 17.5445 143.593 19.5965C139.42 24.3401 135.106 29.2446 130.918 34.0834C126.73 38.9222 122.505 43.8811 118.419 48.6762C116.665 50.7333 114.91 52.7923 113.152 54.8533C112.677 54.843 112.182 54.8083 111.663 54.7723C110.128 54.5701 108.57 54.6493 107.064 55.0063C105.06 55.6145 103.869 55.0462 102.107 53.6307C92.4085 45.8476 83.3948 39.8002 74.55 35.1446C73.8555 34.8254 73.2439 34.3489 72.7624 33.752C72.2816 33.1552 71.9436 32.4542 71.7758 31.704C71.0743 29.0054 69.3499 26.6922 66.9731 25.2626C64.5969 23.833 61.7583 23.4013 59.0692 24.0605C56.3348 24.7041 53.9423 26.364 52.3692 28.7085C50.7961 31.0531 50.1584 33.9097 50.5836 36.7075C50.6933 37.4468 50.826 38.1861 50.9536 38.89L51.056 39.4685L15.5387 73.8969C15.3582 73.8795 15.1783 73.8596 14.9991 73.8409C14.4072 73.7767 13.7946 73.7124 13.1805 73.6963C7.30631 73.5259 3.69542 76.116 1.80964 81.8503C0.395138 86.151 1.94355 89.9895 3.23178 92.5031C4.10457 94.3089 5.43379 95.8517 7.0859 96.9748C8.73803 98.0985 10.6546 98.7639 12.6428 98.9034C12.843 98.9143 13.0427 98.9195 13.2422 98.9201C15.156 98.8912 17.0327 98.382 18.7028 97.4396C20.3728 96.4965 21.7836 95.1497 22.8082 93.5201C25.8693 88.8825 26.3451 84.5362 24.2534 80.2489L58.7173 47.1571L68.318 44.1679L96.7993 63.863C97.0238 68.0989 98.0703 71.2753 100.173 74.1232C101.397 75.8724 103.174 77.1517 105.213 77.7521C107.252 78.3519 109.432 78.2368 111.398 77.4262C117.081 75.2495 120.237 70.4261 120.088 64.1697L154.653 20.8963C159.556 21.8606 163.362 21.4107 165.969 19.5528C167.985 18.1186 169.212 15.895 169.615 12.9436C169.846 11.4554 169.772 9.93496 169.397 8.4767C169.022 7.01851 168.354 5.65349 167.434 4.46625C166.462 3.27794 165.259 2.30335 163.898 1.60274C162.538 0.902131 161.049 0.490445 159.524 0.393145Z"
        fill={color}
      />
    </g>
    <defs>
      <clipPath id="clip0">
        <rect
          fill="white"
          height="99"
          transform="translate(0.777344)"
          width="169"
        />
      </clipPath>
    </defs>
  </svg>
);

export const EyeballIcon = ({ color, size }: IconProps): JSX.Element => (
  <svg
    fill={color}
    width={size}
    height={size}
    enableBackground="new 0 0 32 32"
    id="Layer_1"
    version="1.1"
    viewBox="0 0 32 32"
    xmlSpace="preserve"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
  >
    <g>
      <polyline
        fill="none"
        points="   649,137.999 675,137.999 675,155.999 661,155.999  "
        stroke="#FFFFFF"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit="10"
        strokeWidth="2"
      />
      <polyline
        fill="none"
        points="   653,155.999 649,155.999 649,141.999  "
        stroke="#FFFFFF"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit="10"
        strokeWidth="2"
      />
      <polyline
        fill="none"
        points="   661,156 653,162 653,156  "
        stroke="#FFFFFF"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit="10"
        strokeWidth="2"
      />
    </g>
    <g>
      <g>
        <path d="M16,25c-4.265,0-8.301-1.807-11.367-5.088c-0.377-0.403-0.355-1.036,0.048-1.413c0.404-0.377,1.036-0.355,1.414,0.048    C8.778,21.419,12.295,23,16,23c4.763,0,9.149-2.605,11.84-7c-2.69-4.395-7.077-7-11.84-7c-4.938,0-9.472,2.801-12.13,7.493    c-0.272,0.481-0.884,0.651-1.363,0.377c-0.481-0.272-0.649-0.882-0.377-1.363C5.147,10.18,10.333,7,16,7    c5.668,0,10.853,3.18,13.87,8.507c0.173,0.306,0.173,0.68,0,0.985C26.853,21.819,21.668,25,16,25z" />
      </g>
      <g>
        <path d="M16,21c-2.757,0-5-2.243-5-5s2.243-5,5-5s5,2.243,5,5S18.757,21,16,21z M16,13c-1.654,0-3,1.346-3,3s1.346,3,3,3    s3-1.346,3-3S17.654,13,16,13z" />
      </g>
    </g>
  </svg>
);

export const EyeTransform = ({
  color,
  size,
  line,
}: IconProps & { line: boolean }): JSX.Element => (
  <svg
    width={size}
    height={size}
    fill={color}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
  >
    {!line && <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" />}
    {line && (
      <line
        x1="10%"
        y1="10%"
        x2="90%"
        y2="90%"
        stroke={color}
        strokeWidth={2}
      />
    )}
    <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
  </svg>
);

export const ObjectivesIconOne = ({ color, size }: IconProps): JSX.Element => (
  <svg
    width={size}
    height={size}
    fill={color}
    id="Layer_1"
    enableBackground="new 0 0 100.4 100.4"
    version="1.1"
    viewBox="0 0 100.4 100.4"
    xmlSpace="preserve"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
  >
    <g>
      <path d="M79.1,10.1H63.2V3.3c0-0.8-0.7-1.5-1.5-1.5H38c-0.8,0-1.5,0.7-1.5,1.5v6.8H19.7c-3.5,0-6.3,2.8-6.3,6.3v75.4   c0,3.5,2.8,6.3,6.3,6.3h59.5c3.5,0,6.3-2.8,6.3-6.3V16.4C85.4,12.9,82.6,10.1,79.1,10.1z M38,29.5h23.7c0.8,0,1.5-0.7,1.5-1.5v-6.5   h10.5v64.7H25.1V21.6h11.4V28C36.5,28.9,37.2,29.5,38,29.5z M60.2,4.8V20c0,0,0,0,0,0s0,0,0,0v6.5H39.5v-6.5c0,0,0,0,0,0s0,0,0,0   v-8.5c0,0,0,0,0,0s0,0,0,0V4.8L60.2,4.8L60.2,4.8z M82.4,91.7c0,1.8-1.5,3.3-3.3,3.3H19.7c-1.8,0-3.3-1.5-3.3-3.3V16.4   c0-1.8,1.5-3.3,3.3-3.3h16.8v5.5H23.6c-0.8,0-1.5,0.7-1.5,1.5v67.7c0,0.8,0.7,1.5,1.5,1.5h51.6c0.8,0,1.5-0.7,1.5-1.5V20.1   c0-0.8-0.7-1.5-1.5-1.5h-12v-5.5h15.9c1.8,0,3.3,1.5,3.3,3.3V91.7z" />
      <path d="M28.8,46.4c0,0.8,0.7,1.5,1.5,1.5h38.5c0.8,0,1.5-0.7,1.5-1.5s-0.7-1.5-1.5-1.5H30.3C29.5,44.9,28.8,45.6,28.8,46.4z" />
      <path d="M68.8,55.4H30.3c-0.8,0-1.5,0.7-1.5,1.5s0.7,1.5,1.5,1.5h38.5c0.8,0,1.5-0.7,1.5-1.5S69.6,55.4,68.8,55.4z" />
      <path d="M68.8,66.4H30.3c-0.8,0-1.5,0.7-1.5,1.5c0,0.8,0.7,1.5,1.5,1.5h38.5c0.8,0,1.5-0.7,1.5-1.5C70.3,67.1,69.6,66.4,68.8,66.4z" />
    </g>
  </svg>
);

export const TiersIconOne = ({ color, size }: IconProps): JSX.Element => (
  <svg
    fill={color}
    width={size}
    height={size}
    color={color}
    xmlns="http://www.w3.org/2000/svg"
    id="Layer_1"
    data-name="Layer 1"
    viewBox="0 0 24 24"
  >
    <path d="M23.413,18.24,15.593,2.275a4,4,0,0,0-7.185,0L.587,18.24A4,4,0,0,0,4.179,24H19.82a4,4,0,0,0,3.593-5.76ZM19.6,15H4.4L6.85,10h10.3ZM10.2,3.155a2,2,0,0,1,3.592,0L16.169,8H7.83Zm11.314,17.9a1.964,1.964,0,0,1-1.7.942H4.179a2,2,0,0,1-1.8-2.88L3.421,17H20.578l1.038,2.12A1.961,1.961,0,0,1,21.518,21.058Z" />
  </svg>
);

export const UsersIconOne = ({ color, size }: IconProps): JSX.Element => (
  <svg
    width={size}
    height={size}
    fill={color}
    viewBox="0 0 256 256"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect fill="none" height="256" width="256" />
    <circle
      cx="128"
      cy="128"
      fill="none"
      r="96"
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="8"
    />
    <circle
      cx="128"
      cy="120"
      fill="none"
      r="40"
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="8"
    />
    <path
      d="M63.8,199.4a72,72,0,0,1,128.4,0"
      fill="none"
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="8"
    />
  </svg>
);

export const ChecklistIcon = ({ color, size }: IconProps): JSX.Element => (
  <svg
    width={size}
    height={size}
    fill={color}
    viewBox="0 0 512 512"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M118.2 199.9L63.09 261.1l-22.12-22.11c-9.375-9.375-24.56-9.375-33.94 0s-9.375 24.56 0 33.94l40 40C51.53 317.5 57.66 320 63.1 320c.2187 0 .4065 0 .6253-.0156c6.594-.1719 12.81-3.031 17.22-7.922l72-80c8.875-9.859 8.062-25.03-1.781-33.91C142.2 189.3 127.1 190.1 118.2 199.9zM118.2 39.94L63.09 101.1l-22.12-22.11c-9.375-9.375-24.56-9.375-33.94 0s-9.375 24.56 0 33.94l40 40C51.53 157.5 57.66 160 63.1 160c.2187 0 .4065 0 .6253-.0156c6.594-.1719 12.81-3.031 17.22-7.922l72-80c8.875-9.859 8.062-25.03-1.781-33.91C142.2 29.31 127.1 30.09 118.2 39.94zM48 367.1c-26.51 0-48 21.49-48 48c0 26.51 21.49 48 48 48s48-21.49 48-48C96 389.5 74.51 367.1 48 367.1zM256 128h224c17.67 0 32-14.33 32-32s-14.33-32-32-32h-224C238.3 64 224 78.33 224 96S238.3 128 256 128zM480 224h-224C238.3 224 224 238.3 224 256s14.33 32 32 32h224c17.67 0 32-14.33 32-32S497.7 224 480 224zM480 384H192c-17.67 0-32 14.33-32 32s14.33 32 32 32h288c17.67 0 32-14.33 32-32S497.7 384 480 384z" />
  </svg>
);

export const PointsIcon = ({ color, size }: IconProps): JSX.Element => (
  <svg
    width={size}
    height={size}
    fill={color}
    data-name="Layer 1"
    id="Layer_1"
    viewBox="0 0 512 512"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M479.41,454.14,381.72,403a10,10,0,0,0-5.43-1.13c-1.1.07-110.56,7.75-126.64,8.13-14.1-1.63-124-56.54-198.69-95.59,6.36-5.37,20.88-12.62,42.78-4.06,22.26,8.71,73,27.9,96,36.56a50.27,50.27,0,0,0-5,14.74,18.2,18.2,0,0,0,18,20.87,18.66,18.66,0,0,0,4.19-.49c7.87-1.85,79.22-12.31,101-13.52a10.18,10.18,0,0,0,9.6-10.72,10.3,10.3,0,0,0-10.74-9.6c-20.26,1.12-83.71,10.14-101.17,13.34,2.53-7.67,10.52-21.21,26.13-30.1,30.83-17.54,88.84-37.4,122.78-37.84,24.33.23,56.37,27.53,66.55,38.29a10,10,0,0,0,2.35,1.84l46.21,26.43a10.17,10.17,0,1,0,10.1-17.66l-45-25.71c-7-7.11-44.45-43.55-79.85-43.55h-.66c-22.6.29-53.75,8-82.34,18.19-1.67-1.62-37.59-35.93-71.82-35.93-22.37,0-39.05,11.92-39.75,12.43a10.11,10.11,0,0,0-3.47,4.5,138.42,138.42,0,0,0-15.41-4.29c-29.24-5.93-52.89,10.59-61.88,18.14C52.65,284.11,33.87,299,28.78,310.09c-4,8.71-.16,15.63,5,18.37C66.3,345.51,229,430.39,249.48,430.38h.15c15.71-.36,107.33-6.72,125.21-8L470,472.17a10.08,10.08,0,0,0,4.7,1.16,10.17,10.17,0,0,0,4.73-19.19ZM200.11,275.89c17.32,0,38.3,14,50.45,23.88-5.72,2.42-11.17,4.9-16.27,7.4-9.68-5.08-32.7-16.85-55.42-26.35A51.49,51.49,0,0,1,200.11,275.89Zm-62.7,12.24c20.28,4.13,55.43,20.85,75.88,31.14a83.25,83.25,0,0,0-11.58,10.46c-18.45-7-69.83-26.35-95.83-36.45C114.29,289,125.35,285.68,137.41,288.13Z" />
    <path d="M309.08,99.73c11.63-10.5,23.33-26,17.07-42.72a28,28,0,0,0-31.56-17.87c-9,1.63-18.91,7.78-25.29,19.79-6.39-12-16.3-18.15-25.3-19.79A28,28,0,0,0,212.43,57c-6.26,16.69,5.44,32.22,17.07,42.72H171.37V137.3H367.21V99.73Zm-84-37.95a14.28,14.28,0,0,1,16.46-9.28c9.66,1.75,20.93,12.59,20.93,37.39a6.79,6.79,0,1,0,13.57,0c0-24.8,11.28-35.64,20.92-37.4,7.45-1.28,13.83,2.31,16.46,9.29,5.72,15.26-18.39,32.51-26.78,38H251.81C240.85,92.75,219.86,75.83,225.12,61.78Z" />
    <rect height="90.1" width="144.21" x="197.19" y="150.87" />
  </svg>
);

export const ShieldIconOne = ({ color, size }: IconProps): JSX.Element => (
  <svg
    width={size}
    height={size}
    id="Icons"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs></defs>
    <path
      fill={color}
      d="M22.814,9.216l-.826-5.368A1,1,0,0,0,21,3C15.533,3,12.731.316,12.707.293a1,1,0,0,0-1.41,0C11.269.316,8.467,3,3,3a1,1,0,0,0-.988.848L1.186,9.216A12.033,12.033,0,0,0,7.3,21.576l4.22,2.3a1,1,0,0,0,.958,0l4.22-2.3A12.033,12.033,0,0,0,22.814,9.216Zm-7.072,10.6L12,21.861,8.258,19.82a10.029,10.029,0,0,1-5.1-10.3l.7-4.541A14.717,14.717,0,0,0,12,2.3,14.717,14.717,0,0,0,20.139,4.98l.7,4.54A10.029,10.029,0,0,1,15.742,19.82Z"
    />
    <path
      fill={color}
      d="M15.293,8.293,10,13.586,8.707,12.293a1,1,0,1,0-1.414,1.414l2,2a1,1,0,0,0,1.414,0l6-6a1,1,0,0,0-1.414-1.414Z"
    />
  </svg>
);

export const SettingsOne = ({ color, size }: IconProps): JSX.Element => (
  <svg
    width={size}
    height={size}
    fill={color}
    data-name="Livello 1"
    id="Livello_1"
    viewBox="0 0 128 128"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title />
    <path d="M64,39A25,25,0,1,0,89,64,25,25,0,0,0,64,39Zm0,44A19,19,0,1,1,83,64,19,19,0,0,1,64,83Z" />
    <path d="M121,48h-8.93a1,1,0,0,1-.94-.68,49.9,49.9,0,0,0-2-4.85,1,1,0,0,1,.18-1.15L115.62,35a7,7,0,0,0,0-9.9L102.89,12.38a7,7,0,0,0-9.9,0l-6.31,6.31a1,1,0,0,1-1.15.18,49.76,49.76,0,0,0-4.85-2,1,1,0,0,1-.68-.94V7a7,7,0,0,0-7-7H55a7,7,0,0,0-7,7v8.93a1,1,0,0,1-.68.94,49.9,49.9,0,0,0-4.85,2,1,1,0,0,1-1.15-.18L35,12.38a7,7,0,0,0-9.9,0L12.38,25.11a7,7,0,0,0,0,9.9l6.31,6.31a1,1,0,0,1,.18,1.15,49.76,49.76,0,0,0-2,4.85,1,1,0,0,1-.94.68H7a7,7,0,0,0-7,7V73a7,7,0,0,0,7,7h8.93a1,1,0,0,1,.94.68,49.9,49.9,0,0,0,2,4.85,1,1,0,0,1-.18,1.15L12.38,93a7,7,0,0,0,0,9.9l12.73,12.73a7,7,0,0,0,9.9,0l6.31-6.31a1,1,0,0,1,1.15-.18,49.76,49.76,0,0,0,4.85,2,1,1,0,0,1,.68.94V121a7,7,0,0,0,7,7H73a7,7,0,0,0,7-7v-8.93a1,1,0,0,1,.68-.94,49.9,49.9,0,0,0,4.85-2,1,1,0,0,1,1.15.18L93,115.62a7,7,0,0,0,9.9,0l12.73-12.73a7,7,0,0,0,0-9.9l-6.31-6.31a1,1,0,0,1-.18-1.15,49.76,49.76,0,0,0,2-4.85,1,1,0,0,1,.94-.68H121a7,7,0,0,0,7-7V55A7,7,0,0,0,121,48Zm1,25a1,1,0,0,1-1,1h-8.93a7,7,0,0,0-6.6,4.69,43.9,43.9,0,0,1-1.76,4.26,7,7,0,0,0,1.35,8l6.31,6.31a1,1,0,0,1,0,1.41L98.65,111.38a1,1,0,0,1-1.41,0l-6.31-6.31a7,7,0,0,0-8-1.35,43.88,43.88,0,0,1-4.27,1.76,7,7,0,0,0-4.68,6.6V121a1,1,0,0,1-1,1H55a1,1,0,0,1-1-1v-8.93a7,7,0,0,0-4.69-6.6,43.9,43.9,0,0,1-4.26-1.76,7,7,0,0,0-8,1.35l-6.31,6.31a1,1,0,0,1-1.41,0L16.62,98.65a1,1,0,0,1,0-1.41l6.31-6.31a7,7,0,0,0,1.35-8,43.88,43.88,0,0,1-1.76-4.27A7,7,0,0,0,15.93,74H7a1,1,0,0,1-1-1V55a1,1,0,0,1,1-1h8.93a7,7,0,0,0,6.6-4.69,43.9,43.9,0,0,1,1.76-4.26,7,7,0,0,0-1.35-8l-6.31-6.31a1,1,0,0,1,0-1.41L29.35,16.62a1,1,0,0,1,1.41,0l6.31,6.31a7,7,0,0,0,8,1.35,43.88,43.88,0,0,1,4.27-1.76A7,7,0,0,0,54,15.93V7a1,1,0,0,1,1-1H73a1,1,0,0,1,1,1v8.93a7,7,0,0,0,4.69,6.6,43.9,43.9,0,0,1,4.26,1.76,7,7,0,0,0,8-1.35l6.31-6.31a1,1,0,0,1,1.41,0l12.73,12.73a1,1,0,0,1,0,1.41l-6.31,6.31a7,7,0,0,0-1.35,8,43.88,43.88,0,0,1,1.76,4.27,7,7,0,0,0,6.6,4.68H121a1,1,0,0,1,1,1Z" />
  </svg>
);

export const CoinsOne = ({ color, size }: IconProps): JSX.Element => (
  <svg
    width={size}
    height={size}
    fill={color}
    viewBox="0 0 512 512"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M0 405.3V448c0 35.3 86 64 192 64s192-28.7 192-64v-42.7C342.7 434.4 267.2 448 192 448S41.3 434.4 0 405.3zM320 128c106 0 192-28.7 192-64S426 0 320 0 128 28.7 128 64s86 64 192 64zM0 300.4V352c0 35.3 86 64 192 64s192-28.7 192-64v-51.6c-41.3 34-116.9 51.6-192 51.6S41.3 334.4 0 300.4zm416 11c57.3-11.1 96-31.7 96-55.4v-42.7c-23.2 16.4-57.3 27.6-96 34.5v63.6zM192 160C86 160 0 195.8 0 240s86 80 192 80 192-35.8 192-80-86-80-192-80zm219.3 56.3c60-10.8 100.7-32 100.7-56.3v-42.7c-35.5 25.1-96.5 38.6-160.7 41.8 29.5 14.3 51.2 33.5 60 57.2z" />
  </svg>
);

export const KeyIcon = ({ color, size }: IconProps): JSX.Element => (
  <svg
    width={size}
    height={size}
    fill={color}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M18.2493 6.99982C18.2493 7.69017 17.6896 8.24982 16.9993 8.24982C16.3089 8.24982 15.7493 7.69017 15.7493 6.99982C15.7493 6.30946 16.3089 5.74982 16.9993 5.74982C17.6896 5.74982 18.2493 6.30946 18.2493 6.99982Z"
      fill={color}
    />
    <path
      d="M15.4992 2.0498C11.885 2.0498 8.94922 4.98559 8.94922 8.5998C8.94922 8.98701 8.99939 9.36017 9.05968 9.70382C9.07749 9.80529 9.04493 9.89344 8.99046 9.94791L2.75467 16.1837C2.23895 16.6994 1.94922 17.3989 1.94922 18.1282V20.2998C1.94922 21.2663 2.73272 22.0498 3.69922 22.0498H6.19922C7.16572 22.0498 7.94922 21.2663 7.94922 20.2998V19.0498H9.69922C10.3896 19.0498 10.9492 18.4902 10.9492 17.7998V16.0498H12.6992C13.3741 16.0498 13.9241 15.515 13.9484 14.846C14.4451 14.9738 14.9689 15.0498 15.4992 15.0498C19.1134 15.0498 22.0492 12.114 22.0492 8.4998C22.0492 4.86866 19.0963 2.0498 15.4992 2.0498ZM10.4492 8.5998C10.4492 5.81402 12.7134 3.5498 15.4992 3.5498C18.3021 3.5498 20.5492 5.73095 20.5492 8.4998C20.5492 11.2856 18.285 13.5498 15.4992 13.5498C14.8199 13.5498 14.1206 13.3787 13.4947 13.1104C13.2629 13.0111 12.9968 13.0349 12.7864 13.1737C12.5759 13.3125 12.4492 13.5477 12.4492 13.7998V14.5498H10.6992C10.0089 14.5498 9.44922 15.1094 9.44922 15.7998V17.5498H7.69922C7.00886 17.5498 6.44922 18.1094 6.44922 18.7998V20.2998C6.44922 20.4379 6.33729 20.5498 6.19922 20.5498H3.69922C3.56115 20.5498 3.44922 20.4379 3.44922 20.2998V18.1282C3.44922 17.7967 3.58091 17.4788 3.81534 17.2443L10.0511 11.0086C10.4695 10.5902 10.6349 10.0018 10.5371 9.44461C10.4834 9.13865 10.4492 8.8622 10.4492 8.5998Z"
      fill={color}
    />
  </svg>
);

export const DomainIcon = ({ color, size }: IconProps): JSX.Element => (
  <svg
    width={size}
    height={size}
    fill={color}
    id="Layer_1"
    version="1.1"
    viewBox="0 0 128 128"
    xmlSpace="preserve"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
  >
    <g>
      <path d="M64,126c34.2,0,62-27.8,62-62S98.2,2,64,2S2,29.8,2,64S29.8,126,64,126z M16,88.7l25.2-0.2c2.8,10.1,7.5,19.9,13.9,28.7   C38,114.4,23.7,103.5,16,88.7z M47.6,47H79c2.3,11,2.3,22.3,0.2,33.3l-31.6,0.2C45.3,69.4,45.3,58,47.6,47z M63.3,114.9   c-6.3-8.1-10.9-17-13.7-26.4l27.5-0.2C74.2,97.7,69.6,106.7,63.3,114.9z M71.3,117.5c6.6-9,11.3-18.9,14.1-29.3l26.9-0.2   C104.5,103.7,89.3,115,71.3,117.5z M118,64c0,5.6-0.9,11-2.4,16l-28.3,0.2c2-11,1.9-22.2-0.2-33.2h28.1C117,52.3,118,58.1,118,64z    M111.8,39H85.2c-2.9-10-7.5-19.7-13.9-28.5C89,12.9,103.9,23.8,111.8,39z M76.9,39H49.7c2.9-9.2,7.4-17.9,13.6-25.9   C69.5,21.1,74,29.8,76.9,39z M55.1,10.8C48.8,19.5,44.2,29,41.4,39H16.2C23.9,24.3,38.1,13.6,55.1,10.8z M39.5,47   c-2.1,11.1-2.1,22.4-0.1,33.5l-26.7,0.2C10.9,75.4,10,69.8,10,64c0-5.9,1-11.7,2.8-17H39.5z" />
    </g>
  </svg>
);

export const UpDownChevron = ({ color, size }: IconProps): JSX.Element => (
  <svg
    width={size}
    height={size}
    fill="none"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15.1029 7.30379C15.3208 7.5974 15.2966 8.01406 15.0303 8.28033C14.7374 8.57322 14.2626 8.57322 13.9697 8.28033L10 4.31066L6.03033 8.28033L5.94621 8.35295C5.6526 8.5708 5.23594 8.5466 4.96967 8.28033C4.67678 7.98744 4.67678 7.51256 4.96967 7.21967L9.46967 2.71967L9.55379 2.64705C9.8474 2.4292 10.2641 2.4534 10.5303 2.71967L15.0303 7.21967L15.1029 7.30379ZM4.89705 12.6962C4.6792 12.4026 4.7034 11.9859 4.96967 11.7197C5.26256 11.4268 5.73744 11.4268 6.03033 11.7197L10 15.6893L13.9697 11.7197L14.0538 11.6471C14.3474 11.4292 14.7641 11.4534 15.0303 11.7197C15.3232 12.0126 15.3232 12.4874 15.0303 12.7803L10.5303 17.2803L10.4462 17.3529C10.1526 17.5708 9.73594 17.5466 9.46967 17.2803L4.96967 12.7803L4.89705 12.6962Z"
      fill={color}
    />
  </svg>
);

export const DownChevron = ({ color, size }: IconProps): JSX.Element => (
  <svg
    width={size}
    height={size}
    fill={color}
    viewBox="0 0 24 24"
    role="presentation"
    focusable="false"
    aria-hidden="true"
  >
    <path
      fill="currentColor"
      d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"
    ></path>
  </svg>
);

export const AddIcon = ({ color, size }: IconProps): JSX.Element => (
  <svg
    width={size}
    height={size}
    fill={color}
    id="Layer_1"
    enableBackground="new 0 0 32 32"
    version="1.1"
    viewBox="0 0 32 32"
    xmlSpace="preserve"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
  >
    <path d="M28,14H18V4c0-1.104-0.896-2-2-2s-2,0.896-2,2v10H4c-1.104,0-2,0.896-2,2s0.896,2,2,2h10v10c0,1.104,0.896,2,2,2  s2-0.896,2-2V18h10c1.104,0,2-0.896,2-2S29.104,14,28,14z" />
  </svg>
);

export const ArrowIcon = ({
  color,
  size,
  right,
}: IconProps & { right: boolean }): JSX.Element => (
  <svg
    width={size}
    height={size}
    fill={color}
    viewBox="0 0 48 48"
    className={right ? "rotate-180" : ""}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M0 0h48v48h-48z" fill="none" />
    <path d="M40 22h-24.34l11.17-11.17-2.83-2.83-16 16 16 16 2.83-2.83-11.17-11.17h24.34v-4z" />
  </svg>
);

export const ReadIcon = ({ color, size }: IconProps): JSX.Element => (
  <svg
    width={size}
    height={size}
    fill={color}
    viewBox="0 0 512 512"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M0 219.2v212.5c0 14.25 11.62 26.25 26.5 27C75.32 461.2 180.2 471.3 240 511.9V245.2C181.4 205.5 79.99 194.8 29.84 192C13.59 191.1 0 203.6 0 219.2zM482.2 192c-50.09 2.848-151.3 13.47-209.1 53.09C272.1 245.2 272 245.3 272 245.5v266.5c60.04-40.39 164.7-50.76 213.5-53.28C500.4 457.9 512 445.9 512 431.7V219.2C512 203.6 498.4 191.1 482.2 192zM352 96c0-53-43-96-96-96S160 43 160 96s43 96 96 96S352 149 352 96z" />
  </svg>
);

export const InfoIcon = ({ color, size }: IconProps): JSX.Element => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title />
    <path
      d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm-.5,3A1.5,1.5,0,1,1,10,6.5,1.5,1.5,0,0,1,11.5,5ZM14,18H13a2,2,0,0,1-2-2V12a1,1,0,0,1,0-2h1a1,1,0,0,1,1,1v5h1a1,1,0,0,1,0,2Z"
      fill={color}
    />
  </svg>
);

export const FormErrorIcon = ({ color, size }: IconProps): JSX.Element => (
  <svg
    width={size}
    height={size}
    fill={color}
    viewBox="0 0 48 48"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M0 0h48v48H0V0z" fill="none" />
    <path d="M22 30h4v4h-4zm0-16h4v12h-4zm1.99-10C12.94 4 4 12.95 4 24s8.94 20 19.99 20S44 35.05 44 24 35.04 4 23.99 4zM24 40c-8.84 0-16-7.16-16-16S15.16 8 24 8s16 7.16 16 16-7.16 16-16 16z" />
  </svg>
);

export const RightChevron = ({ color, size }: IconProps): JSX.Element => (
  <svg
    width={size}
    height={size}
    fill="none"
    stroke={color}
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export const TrashcanDelete = ({ color, size }: IconProps): JSX.Element => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    display="block"
    enableBackground="new 0 0 24 24"
  >
    <path
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 2.5v-2h4v2M1 2.5h14M9.533 13.5l.25-9M6.217 4.5l.25 9M2.661 4.5l.889 11h8.9l.888-11"
    ></path>
  </svg>
);

export const EditPencil = ({ color, size }: IconProps): JSX.Element => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-hidden="false"
    aria-labelledby="ltclid25_title "
  >
    <title id="ltclid25_title">Edit</title>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2 14V11.7071L9.5 4.20708L11.7929 6.49998L4.29289 14H2ZM12.5 5.79287L13.7929 4.49998L11.5 2.20708L10.2071 3.49998L12.5 5.79287ZM11.1464 1.14642L1.14645 11.1464L1 11.5V14.5L1.5 15H4.5L4.85355 14.8535L14.8536 4.85353V4.14642L11.8536 1.14642H11.1464Z"
      fill={color}
    ></path>
  </svg>
);

export const ThumbDots = ({ size }: Partial<IconProps>): JSX.Element => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5 4C5.55228 4 6 3.55228 6 3C6 2.44772 5.55228 2 5 2C4.44772 2 4 2.44772 4 3C4 3.55228 4.44772 4 5 4ZM6 8C6 8.55228 5.55228 9 5 9C4.44772 9 4 8.55228 4 8C4 7.44772 4.44772 7 5 7C5.55228 7 6 7.44772 6 8ZM6 13C6 13.5523 5.55228 14 5 14C4.44772 14 4 13.5523 4 13C4 12.4477 4.44772 12 5 12C5.55228 12 6 12.4477 6 13ZM12 8C12 8.55228 11.5523 9 11 9C10.4477 9 10 8.55228 10 8C10 7.44772 10.4477 7 11 7C11.5523 7 12 7.44772 12 8ZM11 14C11.5523 14 12 13.5523 12 13C12 12.4477 11.5523 12 11 12C10.4477 12 10 12.4477 10 13C10 13.5523 10.4477 14 11 14ZM12 3C12 3.55228 11.5523 4 11 4C10.4477 4 10 3.55228 10 3C10 2.44772 10.4477 2 11 2C11.5523 2 12 2.44772 12 3Z"
      fill="#676B5F"
    ></path>
  </svg>
);

export const DateIcon = ({ color, size }: IconProps): JSX.Element => (
  <svg
    width={size}
    height={size}
    enableBackground="new 0 0 500 500"
    id="Layer_1"
    version="1.1"
    viewBox="0 0 500 500"
    xmlSpace="preserve"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
  >
    <path
      clipRule="evenodd"
      d="M31.949,431.711c0,20.078,16.264,36.34,36.34,36.34h363.421  c20.078,0,36.34-16.262,36.34-36.34V113.718c0-20.079-16.262-36.343-36.34-36.343h-36.345V54.662  c0-12.536-10.176-22.713-22.711-22.713c-12.537,0-22.717,10.177-22.717,22.713v22.713h-36.34V54.662  c0-12.536-10.179-22.713-22.715-22.713s-22.712,10.177-22.712,22.713v22.713H231.83V54.662c0-12.536-10.177-22.713-22.713-22.713  c-12.539,0-22.716,10.177-22.716,22.713v22.713h-36.34V54.662c0-12.536-10.177-22.713-22.715-22.713  c-12.536,0-22.713,10.177-22.713,22.713v22.713H68.29c-20.077,0-36.34,16.264-36.34,36.343V431.711z M97.367,122.802h7.266v31.799  c0,12.538,10.177,22.715,22.713,22.715c12.539,0,22.715-10.177,22.715-22.715v-31.799h36.34v31.799  c0,12.538,10.177,22.715,22.716,22.715c12.536,0,22.713-10.177,22.713-22.715v-31.799h36.342v31.799  c0,12.538,10.176,22.715,22.712,22.715s22.715-10.177,22.715-22.715v-31.799h36.34v31.799c0,12.538,10.18,22.715,22.717,22.715  c12.535,0,22.711-10.177,22.711-22.715v-31.799h7.268c11.084,0,19.99,8.909,19.99,19.991v96.302c0,11.082-8.906,19.991-19.99,19.991  H97.367c-11.086,0-19.991-8.909-19.991-19.991v-96.302C77.375,131.711,86.28,122.802,97.367,122.802z"
      fill={color}
      fillRule="evenodd"
    />
  </svg>
);

export const ClockIcon = ({ color, size }: IconProps): JSX.Element => (
  <svg
    width={size}
    height={size}
    fill={color}
    viewBox="0 0 512 512"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M256 512C114.6 512 0 397.4 0 256C0 114.6 114.6 0 256 0C397.4 0 512 114.6 512 256C512 397.4 397.4 512 256 512zM232 256C232 264 236 271.5 242.7 275.1L338.7 339.1C349.7 347.3 364.6 344.3 371.1 333.3C379.3 322.3 376.3 307.4 365.3 300L280 243.2V120C280 106.7 269.3 96 255.1 96C242.7 96 231.1 106.7 231.1 120L232 256z" />
  </svg>
);

export const OutLink = ({ color, size }: IconProps): JSX.Element => (
  <svg
    width={size}
    height={size}
    fill={color}
    viewBox="0 0 512 512"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M432,320H400a16,16,0,0,0-16,16V448H64V128H208a16,16,0,0,0,16-16V80a16,16,0,0,0-16-16H48A48,48,0,0,0,0,112V464a48,48,0,0,0,48,48H400a48,48,0,0,0,48-48V336A16,16,0,0,0,432,320ZM488,0h-128c-21.37,0-32.05,25.91-17,41l35.73,35.73L135,320.37a24,24,0,0,0,0,34L157.67,377a24,24,0,0,0,34,0L435.28,133.32,471,169c15,15,41,4.5,41-17V24A24,24,0,0,0,488,0Z" />
  </svg>
);

export const ClipboardOne = ({ color, size }: IconProps): JSX.Element => (
  <svg
    width={size}
    height={size}
    fill={color}
    stroke="#000"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect height="4" rx="1" ry="1" width="8" x="8" y="2" />
  </svg>
);

export const FolderIcon = ({ color, size }: IconProps): JSX.Element => (
  <svg
    height={size}
    width={size}
    version="1.1"
    viewBox="0 0 20 16"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
  >
    <title />
    <desc />
    <defs />
    <g fill="none" fillRule="evenodd" id="Page-1" stroke="none" strokeWidth="1">
      <g fill={color} id="Core" transform="translate(-44.000000, -256.000000)">
        <g id="folder" transform="translate(44.000000, 256.000000)">
          <path
            d="M8,0 L2,0 C0.9,0 0,0.9 0,2 L0,14 C0,15.1 0.9,16 2,16 L18,16 C19.1,16 20,15.1 20,14 L20,4 C20,2.9 19.1,2 18,2 L10,2 L8,0 L8,0 Z"
            id="Shape"
          />
        </g>
      </g>
    </g>
  </svg>
);

export const SortIcon = ({ color, size }: IconProps): JSX.Element => (
  <svg
    width={size}
    height={size}
    fill="none"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M14.8393 16.7223C14.702 16.8917 14.4849 17 14.25 17C14.0571 17.001 13.8704 16.9277 13.7232 16.7803L10.7193 13.772C10.4269 13.4791 10.4269 13.0043 10.7193 12.7114C11.0118 12.4185 11.486 12.4185 11.7784 12.7114L13.5 14.4441V3.75C13.5 3.33579 13.8364 3 14.25 3C14.6636 3 15 3.33579 15 3.75V14.4336L16.7216 12.7159C17.014 12.423 17.4882 12.423 17.7807 12.7159C18.0731 13.0088 18.0731 13.4837 17.7807 13.7765L14.8393 16.7223ZM6.33931 3.27775C6.202 3.1083 5.98488 3.00001 5.75 3.00001C5.55709 2.99905 5.37038 3.07227 5.2232 3.21967L2.21934 6.22798C1.92689 6.52087 1.92689 6.99575 2.21934 7.28864C2.5118 7.58153 2.98597 7.58153 3.27843 7.28864L5 5.5559V16.25C5 16.6642 5.3364 17 5.75 17C6.1636 17 6.5 16.6642 6.5 16.25V5.5664L8.22157 7.28412C8.51403 7.57702 8.9882 7.57702 9.28066 7.28412C9.57311 6.99123 9.57311 6.51636 9.28066 6.22346L6.33931 3.27775Z"
      fill={color}
    />
  </svg>
);

export const WarningIcon = ({ color, size }: IconProps): JSX.Element => (
  <svg
    width={size}
    height={size}
    fill={color}
    viewBox="0 0 512 512"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title />
    <path d="M449.07,399.08,278.64,82.58c-12.08-22.44-44.26-22.44-56.35,0L51.87,399.08A32,32,0,0,0,80,446.25H420.89A32,32,0,0,0,449.07,399.08Zm-198.6-1.83a20,20,0,1,1,20-20A20,20,0,0,1,250.47,397.25ZM272.19,196.1l-5.74,122a16,16,0,0,1-32,0l-5.74-121.95v0a21.73,21.73,0,0,1,21.5-22.69h.21a21.74,21.74,0,0,1,21.73,22.7Z" />
  </svg>
);

export const EthIcon = ({ color, size }: IconProps): JSX.Element => (
  <svg
    width={size}
    height={size}
    fill={color}
    data-name="Layer 1"
    id="Layer_1"
    viewBox="0 0 128 128"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title />
    <polygon points="28.09 65.65 64 7 99.91 65.65 64 86.57 28.09 65.65" />
    <polygon points="64 93.16 98.76 71.58 64 121 28.42 71.58 64 93.16" />
  </svg>
);

export const ERC721Icon = ({ color, size }: IconProps): JSX.Element => (
  <svg
    className={size ? "" : "mt-2"}
    width={size}
    height={size}
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    version="1.1"
    x="0px"
    y="0px"
    viewBox="0 0 32 40"
    enableBackground="new 0 0 32 32"
    xmlSpace="preserve"
  >
    <circle fill={color} cx="11.7000122" cy="12.1699829" r="1.5" />
    <path
      fill={color}
      d="M3.1799927,20.3999634c0,1.8500366,0.9899902,3.5800171,2.6000366,4.5l3.6099854,2.0900269  c2.1599731-8.4000244,9.9599609-14.7700195,19.4299927-15.3699951v-0.0200195c0-1.8499756-1-3.5800171-2.6000366-4.5  l-7.6199951-4.3999634c-1.6099854-0.9300537-3.5999756-0.9300537-5.1999512,0L5.7800293,7.0999756  c-1.6100464,0.9199829-2.6000366,2.6500244-2.6000366,4.5V20.3999634z M11.7000122,8.6699829c1.9299927,0,3.5,1.5700073,3.5,3.5  c0,1.9199829-1.5700073,3.5-3.5,3.5s-3.5-1.5800171-3.5-3.5C8.2000122,10.2399902,9.7700195,8.6699829,11.7000122,8.6699829z"
    />
    <path
      fill={color}
      d="M13.4000244,29.2999878C14.2000122,29.7699585,15.0999756,30,16,30s1.7999878-0.2300415,2.5999756-0.7000122  l7.6199951-4.4000244c1.6000366-0.9199829,2.6000366-2.6499634,2.6000366-4.5v-6.7799683  c-8.75,0.6199951-15.9000244,6.5999756-17.6199951,14.4099731L13.4000244,29.2999878z"
    />
  </svg>
);

export const ERC1155Icon = ({ color, size }: IconProps): JSX.Element => (
  <svg
    className={size ? "" : "mt-2"}
    width={size ?? "50px"}
    height={size ?? "50px"}
    fill={color}
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 48 60"
    version="1.1"
    xmlSpace="preserve"
    x="0px"
    y="0px"
    fillRule="evenodd"
    clipRule="evenodd"
    strokeLinejoin="round"
    strokeMiterlimit="2"
  >
    <g>
      <path
        fill={color}
        d="M20.178,8.886l-3.19,-0.855c-1.599,-0.429 -3.245,0.522 -3.674,2.121l-1.012,3.776l-3.302,0c-1.656,0 -3,1.344 -3,3c0,0 0,24 0,24c0,1.656 1.344,3 3,3l16,0c1.656,0 3,-1.344 3,-3l0,-0.582l0.949,-3.54l12.227,-20.29c0.003,-0.005 0.007,-0.011 0.01,-0.016c0.828,-1.434 0.335,-3.27 -1.098,-4.098c-0,-0 -13.857,-8 -13.857,-8c-1.434,-0.828 -3.27,-0.336 -4.098,1.098l-1.955,3.386Zm-7.09,7.042c-0.011,0 -0.023,0 -0.034,0l-4.054,0c-0.552,0 -1,0.448 -1,1l-0,24c-0,0.552 0.448,1 1,1c0,0 16,0 16,0c0.552,0 1,-0.448 1,-1l-0,-0.696c-0,-0.011 -0,-0.022 -0,-0.034l-0,-23.27c-0,-0.552 -0.448,-1 -1,-1l-11.912,0Zm4.426,6.215c-0.316,-0.191 -0.712,-0.191 -1.028,-0l-5,3c-0.302,0.18 -0.486,0.506 -0.486,0.857l-0,6c-0,0.351 0.184,0.677 0.486,0.857l5,3c0.316,0.191 0.712,0.191 1.028,0l5,-3c0.302,-0.18 0.486,-0.506 0.486,-0.857l-0,-6c0,-0.351 -0.184,-0.677 -0.486,-0.857l-5,-3Zm-0.514,2.023l4,2.4c-0,0 -0,4.868 -0,4.868c-0,-0 -4,2.4 -4,2.4c-0,-0 -4,-2.4 -4,-2.4c-0,-0 -0,-4.868 -0,-4.868l4,-2.4Zm3.387,-13.154l-3.916,-1.049c-0.533,-0.143 -1.082,0.174 -1.225,0.707l-0.873,3.258l10.627,0c1.656,0 3,1.344 3,3l-0,15.69l4.633,-17.289c0.143,-0.534 -0.174,-1.082 -0.707,-1.225l-11.507,-3.083c-0.01,-0.003 -0.021,-0.006 -0.032,-0.009Zm10.431,18.817c3.624,-6.014 8.641,-14.339 8.645,-14.345c0.263,-0.475 0.097,-1.077 -0.375,-1.35c-0,0 -13.857,-8 -13.857,-8c-0.478,-0.276 -1.09,-0.112 -1.366,0.366l-1.687,2.921l10.265,2.751c1.6,0.428 2.55,2.075 2.122,3.674l-3.747,13.983Z"
      />
    </g>
  </svg>
);

export const CheckboxCheck = ({
  color,
  w,
  h,
}: IconProps & { w: number; h: number }): JSX.Element => (
  <svg
    width={w}
    height={h}
    fill="none"
    strokeWidth={2}
    stroke={color}
    strokeDasharray={16}
    opacity={1}
    strokeDashoffset={0}
    viewBox="0 0 12 10"
  >
    <polyline points="1.5 6 4.5 9 10.5 1"></polyline>
  </svg>
);

export const SelectedCheck = ({ size, color }: IconProps): JSX.Element => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill={color}
    aria-hidden="true"
    focusable="false"
  >
    <path
      fillRule="evenodd"
      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
      clipRule="evenodd"
    ></path>
  </svg>
);
