import { createContext } from "react";

// 인증에 관련된 정보들을 저장하기 위한 context 객체를 생성함
const AuthCotext = createContext(null);

// 위에서 생성한 AuthContext를 다른 코드에서 참조할 수 있도록 노출시킴
export default AuthCotext